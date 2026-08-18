export const debug = false;
export const sandbox = false;
export const port = 8100;
export const apiUrl = `https://admin.toopdelivery.com.br:${port}`;
export const urlAppOffer = '';
export const timeout = 40000;
export const tokenAuth = 'tokenAuth';
export const appName = 'Toop Delivery';
export const appSubiTitle = '';
export const apiGeoLocation = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
export const FIREBASE_PATH = '';

export const IUGU_TOKEN_API =
  process.env.IUGU_TOKEN_API || 'YOUR_IUGU_TOKEN_API';
export const IUGU_ACCOUNT_ID = process.env.IUGU_ACCOUNT_ID || 'YOUR_IUGU_ACCOUNT_ID';
export const IUGU_ENVIRORMENT_TEST = false;

// CyberSorce
export const keyCyberSorce = process.env.CYBERSOURCE_KEY || 'YOUR_CYBERSOURCE_KEY';
export const atributeCyberSorce = 'braspag_split_toopdelivery';
