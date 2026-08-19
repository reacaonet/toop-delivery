# ToopDelivery OTA Server

Over-The-Air updates server for React Native mobile apps.

## How it works

1. **Developer** publishes a JS bundle via CLI → OTA Server stores it
2. **Mobile app** checks for updates on start (or every 30 min)
3. **Server** responds with latest bundle metadata
4. **App** downloads bundle in background
5. **User** restarts app → new code runs automatically

Native code changes still require App Store / Play Store updates.

## Quick start

```bash
# Install dependencies
cd delivery_toop-ota && npm install

# Start server (needs MongoDB running)
npm start

# Server runs on port 8500
```

## Publish an update

```bash
# Build the bundle first
cd mobile/delivery_toop-mobile_driver/android
./gradlew bundleRelease

# Then publish
node cli/ota.js publish driver android 1.0.7 \
  ./build/index.android.bundle \
  --desc "Fix login bug" \
  --mandatory
```

## List updates

```bash
node cli/ota.js list driver android
```

## Rollback

```bash
node cli/ota.js rollback <update-id>
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/updates/check` | Check for update (app, platform, currentVersion) |
| POST | `/api/v1/updates/publish` | Publish new bundle (multipart form) |
| GET | `/api/v1/updates/download/:id` | Download bundle |
| GET | `/api/v1/updates/list` | List all updates |
| DELETE | `/api/v1/updates/:id` | Delete update |
| POST | `/api/v1/updates/:id/rollback` | Rollback to previous version |
| GET | `/health` | Health check |
