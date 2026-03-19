const firebase = require('firebase');

var config = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  databaseURL: process.env.FIREBASE_databaseURL,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

// Only initialize Firebase if all required config is available
if (config.apiKey && config.projectId && config.databaseURL) {
  firebase.initializeApp(config);
  var database = firebase.database();
} else {
  console.warn('Firebase configuration incomplete. Firebase services will be disabled.');
  var database = null;
}

module.exports = database;

