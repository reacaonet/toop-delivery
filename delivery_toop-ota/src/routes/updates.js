const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Update = require('../models/Update');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'storage');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jsbundle', '.bundle', '.js', '.tar.gz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowed.join(', ')}`));
    }
  }
});

router.get('/check', async (req, res) => {
  try {
    const { app, platform, currentVersion, currentBuild } = req.query;

    if (!app || !platform) {
      return res.status(400).json({ error: 'app and platform are required' });
    }

    const update = await Update.findOne({
      app,
      platform,
      isActive: true,
      ...(currentVersion ? { version: { $gt: currentVersion } } : {})
    }).sort({ createdAt: -1 });

    if (!update) {
      return res.json({ updateAvailable: false });
    }

    if (update.minAppVersion && currentVersion && currentVersion < update.minAppVersion) {
      return res.json({
        updateAvailable: false,
        message: 'App version too old, please update from store'
      });
    }

    res.json({
      updateAvailable: true,
      version: update.version,
      buildNumber: update.buildNumber,
      description: update.description,
      bundleHash: update.bundleHash,
      bundleSize: update.bundleSize,
      downloadUrl: `/api/v1/updates/download/${update._id}`,
      mandatory: update.metadata?.get('mandatory') === 'true'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/publish', upload.single('bundle'), async (req, res) => {
  try {
    const { app, platform, version, buildNumber, description, minAppVersion, mandatory } = req.body;

    if (!app || !platform || !version || !req.file) {
      return res.status(400).json({ error: 'app, platform, version, and bundle file are required' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const bundleHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const existing = await Update.findOne({ app, platform, version, bundleHash });
    if (existing) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'This exact bundle already exists', updateId: existing._id });
    }

    const latestBuild = await Update.findOne({ app, platform }).sort({ buildNumber: -1 });
    const nextBuild = latestBuild ? latestBuild.buildNumber + 1 : (parseInt(buildNumber) || 1);

    const update = await Update.create({
      app,
      platform,
      version,
      buildNumber: nextBuild,
      bundleHash,
      bundleSize: req.file.size,
      bundlePath: req.file.filename,
      description: description || '',
      minAppVersion: minAppVersion || null,
      metadata: new Map([['mandatory', mandatory || 'false']])
    });

    res.status(201).json({
      id: update._id,
      version: update.version,
      buildNumber: update.buildNumber,
      bundleHash: update.bundleHash,
      bundleSize: update.bundleSize
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const filePath = path.join(__dirname, '..', '..', 'storage', update.bundlePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Bundle file not found' });
    }

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Content-Length', update.bundleSize);
    res.setHeader('X-OTA-Hash', update.bundleHash);
    res.setHeader('X-OTA-Version', update.version);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { app, platform } = req.query;
    const filter = {};
    if (app) filter.app = app;
    if (platform) filter.platform = platform;

    const updates = await Update.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-bundlePath');

    res.json({ updates, total: updates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const filePath = path.join(__dirname, '..', '..', 'storage', update.bundlePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Update.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/rollback', async (req, res) => {
  try {
    const current = await Update.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const previous = await Update.findOne({
      app: current.app,
      platform: current.platform,
      isActive: true,
      _id: { $ne: current._id }
    }).sort({ createdAt: -1 });

    if (!previous) {
      return res.status(404).json({ error: 'No previous version to rollback to' });
    }

    current.isActive = false;
    await current.save();

    res.json({
      rolledBackTo: {
        id: previous._id,
        version: previous.version,
        buildNumber: previous.buildNumber
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
