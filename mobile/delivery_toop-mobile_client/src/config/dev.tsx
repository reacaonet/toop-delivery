export const debug = true;
export const sandbox = true;
export const port = 8100;
export const apiUrl = `http://localhost:${port}`;
export const urlAppOffer = '';
export const timeout = 30000;
export const tokenAuth = 'USER_AUTH';
export const appName = 'Gojá Delivery';
export const appSubiTitle = 'DEV';
export const apiGeoLocation = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
export const FIREBASE_PATH = 'homolog/';

export const IUGU_TOKEN_API =
  process.env.IUGU_TOKEN_API || 'YOUR_IUGU_TOKEN_API';
export const IUGU_ACCOUNT_ID = process.env.IUGU_ACCOUNT_ID || 'YOUR_IUGU_ACCOUNT_ID';
export const IUGU_ENVIRORMENT_TEST = true;

// CyberSorce
export const keyCyberSorce = process.env.CYBERSOURCE_KEY || 'YOUR_CYBERSOURCE_KEY';
export const atributeCyberSorce = 'braspag_split_toopdelivery';
