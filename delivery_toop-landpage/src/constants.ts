export const APP_URLS = {
  client: import.meta.env.VITE_CLIENT_URL || 'https://app.gojadelivery.com.br',
  store: import.meta.env.VITE_STORE_URL || 'https://loja.gojadelivery.com.br',
  deliveryman: import.meta.env.VITE_DELIVERYMAN_URL || 'https://entregador.gojadelivery.com.br',
  admin: import.meta.env.VITE_ADMIN_URL || 'https://admin.gojadelivery.com.br',
} as const

export const LINKS = {
  clientLogin: `${APP_URLS.client}/login`,
  clientRegister: `${APP_URLS.client}/register`,
  storeLogin: `${APP_URLS.store}/login`,
  storeRegister: `${APP_URLS.store}/register`,
  deliverymanLogin: `${APP_URLS.deliveryman}/login`,
  deliverymanRegister: `${APP_URLS.deliveryman}/register`,
  storeAppGoogle: import.meta.env.VITE_STORE_APP_GOOGLE || 'https://github.com/reacaonet/toop-delivery/releases/download/mobile-apk/goja-cliente.apk',
  storeAppApple: import.meta.env.VITE_STORE_APP_APPLE || '',
} as const