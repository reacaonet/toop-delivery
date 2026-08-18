import * as admin from "firebase-admin";
import * as fs from "fs";

// Try to use service account file first
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '/usr/src/app/firebase-adminsdk.json';

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_databaseURL
  });
  
  console.log('✅ Firebase initialized successfully with service account file');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.warn('⚠️ Firebase services disabled');
}

export default admin;