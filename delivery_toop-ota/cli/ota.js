#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const OTA_SERVER = process.env.OTA_SERVER || 'http://localhost:8500';
const VALID_APPS = ['client', 'deliveryman', 'driver', 'shopper'];
const VALID_PLATFORMS = ['android', 'ios'];

const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`
GojáDelivery OTA CLI

Usage:
  ota publish <app> <platform> <version> <bundle-path> [--desc "message"] [--min-version X.Y.Z] [--mandatory]
  ota list <app> [platform]
  ota rollback <update-id>
  ota delete <update-id>

Examples:
  ota publish driver android 1.0.7 ./build/index.android.bundle --desc "Fix login bug"
  ota list driver android
  ota rollback 64f1a2b3c4d5e6f7a8b9c0d1
`);
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function publish(app, platform, version, bundlePath, opts) {
  if (!VALID_APPS.includes(app)) {
    console.error(`Invalid app: ${app}. Must be one of: ${VALID_APPS.join(', ')}`);
    process.exit(1);
  }
  if (!VALID_PLATFORMS.includes(platform)) {
    console.error(`Invalid platform: ${platform}. Must be: android, ios`);
    process.exit(1);
  }
  if (!fs.existsSync(bundlePath)) {
    console.error(`Bundle file not found: ${bundlePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(bundlePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const size = fileBuffer.length;

  console.log(`\nPublishing ${app}/${platform} v${version}`);
  console.log(`  Bundle: ${bundlePath}`);
  console.log(`  Size: ${(size / 1024).toFixed(1)} KB`);
  console.log(`  Hash: ${hash.substring(0, 16)}...`);

  const boundary = '----ToopOTA' + Date.now();
  const ext = path.extname(bundlePath);
  const filename = `bundle-${app}-${platform}-${version}${ext}`;

  let body = '';
  const fields = {
    app, platform, version,
    description: opts.desc || '',
    minAppVersion: opts.minVersion || '',
    mandatory: opts.mandatory ? 'true' : 'false'
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    }
  }

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="bundle"; filename="${filename}"\r\n`;
  body += `Content-Type: application/javascript\r\n\r\n`;
  body += fileBuffer.toString('binary');
  body += `\r\n--${boundary}--\r\n`;

  const url = new URL(`${OTA_SERVER}/api/v1/updates/publish`);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body, 'binary')
    }
  };

  try {
    const res = await httpRequest(url.toString(), { ...options, body });
    if (res.status === 201) {
      console.log(`\nPublished successfully!`);
      console.log(`  Version: ${res.data.version}`);
      console.log(`  Build: #${res.data.buildNumber}`);
      console.log(`  Hash: ${res.data.bundleHash.substring(0, 16)}...`);
    } else {
      console.error(`\nFailed (${res.status}):`, res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error(`\nError connecting to OTA server: ${err.message}`);
    process.exit(1);
  }
}

async function list(app, platform) {
  let url = `${OTA_SERVER}/api/v1/updates/list?`;
  if (app) url += `app=${app}&`;
  if (platform) url += `platform=${platform}`;

  try {
    const res = await httpRequest(url);
    if (res.status !== 200) {
      console.error(`Error (${res.status}):`, res.data);
      process.exit(1);
    }

    const { updates } = res.data;
    if (!updates.length) {
      console.log('No updates found.');
      return;
    }

    console.log(`\n${'App'.padEnd(12)} ${'Platform'.padEnd(10)} ${'Version'.padEnd(10)} ${'Build'.padEnd(8)} ${'Size'.padEnd(10)} ${'Active'.padEnd(8)} Description`);
    console.log('-'.repeat(80));
    for (const u of updates) {
      const size = u.bundleSize ? `${(u.bundleSize / 1024).toFixed(0)}KB` : '?';
      console.log(
        `${u.app.padEnd(12)} ${u.platform.padEnd(10)} ${u.version.padEnd(10)} #${String(u.buildNumber).padEnd(7)} ${size.padEnd(10)} ${u.isActive ? 'Yes'.padEnd(8) : 'No'.padEnd(8)} ${u.description || ''}`
      );
    }
  } catch (err) {
    console.error(`Error connecting to OTA server: ${err.message}`);
    process.exit(1);
  }
}

async function rollback(updateId) {
  try {
    const res = await httpRequest(`${OTA_SERVER}/api/v1/updates/${updateId}/rollback`, { method: 'POST' });
    if (res.status === 200) {
      console.log(`Rolled back to v${res.data.rolledBackTo.version} (build #${res.data.rolledBackTo.buildNumber})`);
    } else {
      console.error(`Failed (${res.status}):`, res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function deleteUpdate(updateId) {
  try {
    const res = await httpRequest(`${OTA_SERVER}/api/v1/updates/${updateId}`, { method: 'DELETE' });
    if (res.status === 200) {
      console.log(`Deleted update ${updateId}`);
    } else {
      console.error(`Failed (${res.status}):`, res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function parseOpts(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--desc' && args[i + 1]) opts.desc = args[++i];
    if (args[i] === '--min-version' && args[i + 1]) opts.minVersion = args[++i];
    if (args[i] === '--mandatory') opts.mandatory = true;
  }
  return opts;
}

async function main() {
  switch (command) {
    case 'publish':
      if (args.length < 5) { usage(); process.exit(1); }
      await publish(args[1], args[2], args[3], args[4], parseOpts(args.slice(5)));
      break;
    case 'list':
      await list(args[1], args[2]);
      break;
    case 'rollback':
      if (!args[1]) { usage(); process.exit(1); }
      await rollback(args[1]);
      break;
    case 'delete':
      if (!args[1]) { usage(); process.exit(1); }
      await deleteUpdate(args[1]);
      break;
    default:
      usage();
  }
}

main();
