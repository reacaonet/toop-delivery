import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.gojadelivery.cliente',
  appName: 'GoJá Delivery',
  webDir: 'web',
  server: {
    url: 'https://app.gojadelivery.com.br',
    cleartext: false,
    allowNavigation: ['app.gojadelivery.com.br', 'api.gojadelivery.com.br']
  },
  android: {
    allowMixedContent: false
  }
}

export default config