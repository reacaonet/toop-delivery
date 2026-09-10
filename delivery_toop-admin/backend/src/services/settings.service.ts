import { SettingsModel, IPaymentGatewayConfig, PaymentMethod, GATEWAY_PROVIDERS } from "../models/Settings";

async function ensureSettings() {
  let settings = await SettingsModel.findOne();
  if (!settings) {
    settings = await SettingsModel.create({});
  }
  return settings;
}

export async function getPlatformFeePercent(): Promise<number> {
  const settings = await SettingsModel.findOne().lean();
  return settings?.platformFeePercentage ?? 20;
}

export async function getGatewayConfig(): Promise<IPaymentGatewayConfig> {
  const settings = await ensureSettings();
  const pg = settings.paymentGateway || ({} as Partial<IPaymentGatewayConfig>);
  return {
    provider: GATEWAY_PROVIDERS.includes(pg.provider as any) ? pg.provider! : 'PAGARME',
    mode: pg.mode === 'production' ? 'production' : 'sandbox',
    merchantId: pg.merchantId || '',
    merchantKey: pg.merchantKey || '',
    apiKey: pg.apiKey || '',
    token: pg.token || '',
    webhookUrl: pg.webhookUrl || '',
    splitEnabled: !!pg.splitEnabled,
  };
}

export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const settings = await ensureSettings();
  const methods = settings.enabledPaymentMethods;
  if (!Array.isArray(methods) || methods.length === 0) {
    return ['credit_card', 'debit_card', 'pix', 'cash'];
  }
  return methods;
}

export async function setGatewayConfig(config: Partial<IPaymentGatewayConfig>): Promise<IPaymentGatewayConfig> {
  const settings = await ensureSettings();
  settings.paymentGateway = {
    ...(settings.paymentGateway as IPaymentGatewayConfig),
    ...config,
  } as IPaymentGatewayConfig;
  await settings.save();
  return settings.paymentGateway;
}