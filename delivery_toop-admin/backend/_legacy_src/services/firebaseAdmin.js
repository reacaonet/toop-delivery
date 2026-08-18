const admin = require('firebase-admin');

let adminAuth = null

// console.log({
//   projectId: process.env.FIREBASE_projectId,
//   clientEmail: process.env.FIREBASE_client_email,
//   privateKey: process.env.FIREBASE_private_key
// })

if (adminAuth === null) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_projectId,
      clientEmail: process.env.FIREBASE_client_email,
      privateKey: process.env.FIREBASE_private_key
    }),
    databaseURL: process.env.FIREBASE_databaseURL
  });
}

adminAuth = admin


module.exports = admin;
