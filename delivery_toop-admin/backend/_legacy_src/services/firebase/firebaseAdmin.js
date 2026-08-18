const { initializeApp, cert, getApp } = require('firebase-admin/app');

async function getConfig() {

    try {
      const app = getApp(`adminFirebase-Notification`);

      if (app) {
        return app;
      }
    } catch (err) {
      //
    }

    if (
      process.env.CLOUD_FIREBASE_PROJECT_ID &&
      process.env.CLOUD_FIREBASE_private_key
    ) {
      const serviceAccount = cert({
        projectId: `${process.env.CLOUD_FIREBASE_PROJECT_ID}`.trim(),
        privateKey: `${process.env.CLOUD_FIREBASE_private_key}`
          .trim()
          .replace(/\\n/g, '\n'),
        clientEmail: `${process.env.CLOUD_FIREBASE_client_email}`.trim(),
      });

      const defaultApp = initializeApp(
        {
          credential: serviceAccount,
          databaseURL: process.env.FIREBASE_databaseURL,
        },
        `adminFirebase-Notification`,
      );

      return defaultApp;
    }


  return false;
}

module.exports = getConfig;
