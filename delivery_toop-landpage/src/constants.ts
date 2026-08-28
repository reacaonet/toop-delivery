export const APP_URLS = {
  client: 'http://localhost:4200',
  store: 'http://localhost:4203',
  deliveryman: 'http://localhost:4204',
} as const

export const LINKS = {
  clientLogin: `${APP_URLS.client}/login`,
  clientRegister: `${APP_URLS.client}/register`,
  storeLogin: `${APP_URLS.store}/login`,
  storeRegister: `${APP_URLS.store}/register`,
  deliverymanLogin: `${APP_URLS.deliveryman}/login`,
  deliverymanRegister: `${APP_URLS.deliveryman}/register`,
} as const
