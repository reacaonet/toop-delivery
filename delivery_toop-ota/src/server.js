const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.OTA_PORT || 8500;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/toop_ota';

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

app.use('/bundles', express.static(path.join(__dirname, '..', 'storage')));

const updateRoutes = require('./routes/updates');
app.use('/api/v1/updates', updateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ota-server', timestamp: new Date().toISOString() });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[OTA] MongoDB connected');
    app.listen(PORT, () => {
      console.log(`[OTA] Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[OTA] MongoDB connection error:', err.message);
    process.exit(1);
  });
