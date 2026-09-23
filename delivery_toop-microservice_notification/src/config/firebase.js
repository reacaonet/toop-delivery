import firebase from 'firebase';

const databaseURL = process.env.FIREBASE_databaseURL;

var config = {
    apiKey: process.env.FIREBASE_apiKey,
    authDomain: process.env.FIREBASE_authDomain,
    databaseURL,
    projectId: process.env.FIREBASE_projectId,
    storageBucket: process.env.FIREBASE_storageBucket,
    messagingSenderId: process.env.FIREBASE_messagingSenderId,
    appId: process.env.FIREBASE_appId,
    measurementId: process.env.FIREBASE_measurementId,
};

var database = null;

if (databaseURL) {
    firebase.initializeApp(config);
    database = firebase.database();
} else {
    console.warn('FIREBASE_databaseURL not set. Firebase Realtime Database disabled.');
}

export default database;