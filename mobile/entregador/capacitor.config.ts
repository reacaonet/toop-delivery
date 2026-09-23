import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.gojadelivery.entregador',
  appName: 'GoJá Entregador',
  webDir: 'web',
  server: {
    url: 'https://entregador.gojadelivery.com.br',
    cleartext: false,
    allowNavigation: ['entregador.gojadelivery.com.br', 'api.gojadelivery.com.br']
  },
  android: {
    allowMixedContent: false
  }
}

export default config