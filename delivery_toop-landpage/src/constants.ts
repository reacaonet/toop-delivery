export const APP_URLS = {
  client: 'http://app.gojadelivery.app.br:4200',
  store: 'http://loja.gojadelivery.app.br:4203',
  deliveryman: 'http://entregador.gojadelivery.app.br:4204',
  admin: 'http://admin.gojadelivery.app.br:4202',
} as const

export const LINKS = {
  clientLogin: `${APP_URLS.client}/login`,
  clientRegister: `${APP_URLS.client}/register`,
  storeLogin: `${APP_URLS.store}/login`,
  storeRegister: `${APP_URLS.store}/register`,
  deliverymanLogin: `${APP_URLS.deliveryman}/login`,
  deliverymanRegister: `${APP_URLS.deliveryman}/register`,
} as const