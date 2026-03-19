import * as admin from "firebase-admin";
// import  serviceAccount from '../../config/economize-br-app-firebase-adminsdk.json';

admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.CLOUD_FIREBASE_TYPE,
    "project_id": process.env.CLOUD_FIREBASE_PROJECT_ID,
    "private_key_id": process.env.CLOUD_FIREBASE_private_key_id,
    "private_key": process.env.CLOUD_FIREBASE_private_key,
    "client_email": process.env.CLOUD_FIREBASE_client_email,
    "client_id":  process.env.CLOUD_FIREBASE_client_id,
    "auth_uri":  process.env.CLOUD_FIREBASE_auth_uri,
    "token_uri":  process.env.CLOUD_FIREBASE_token_uri,
    "auth_provider_x509_cert_url":  process.env.CLOUD_FIREBASE_auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.CLOUD_FIREBASE_client_x509_cert_url
  }),
  databaseURL: "https://economize-br-app.firebaseio.com"
});

export default admin;