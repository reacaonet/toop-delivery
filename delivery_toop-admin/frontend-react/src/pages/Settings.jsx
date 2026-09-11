import React, { useState, useEffect } from 'react';
import { Bell, Settings as SettingsIcon, User, Building2, Mail, CheckCircle, XCircle, Clock, Percent, Save, Car, CreditCard } from 'lucide-react';
import { notificationService, settingsService } from '../services/api';

const GATEWAY_PROVIDERS = [
  { value: 'BRASPAG', label: 'Braspag' },
  { value: 'PAGARME', label: 'Pagar.me' },
  { value: 'IUGU', label: 'Iugu' },
  { value: 'CIELO', label: 'Cielo' },
  { value: 'PIX', label: 'PIX (direto)' },
  { value: 'ASAAS', label: 'Asaas' },
  { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
  { value: 'PAGSEGURO', label: 'PagSeguro' },
];
const ALL_PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
];

const Settings = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    maintenanceMode: false,
    autoBackup: false,
    emailAlerts: true,
    companyFeePercentage: 15,
    deliverymanFeePercentage: 10,
    platformFeePercentage: 20,
    paymentGateway: {
      provider: 'PAGARME',
      mode: 'sandbox',
      merchantId: '',
      merchantKey: '',
      apiKey: '',
      token: '',
      webhookUrl: '',
      splitEnabled: false,
    },
    enabledPaymentMethods: ['credit_card', 'debit_card', 'pix', 'cash'],
  });

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          paymentGateway: { ...prev.paymentGateway, ...(data.paymentGateway || {}) },
          enabledPaymentMethods: Array.isArray(data.enabledPaymentMethods) && data.enabledPaymentMethods.length > 0
            ? data.enabledPaymentMethods
            : prev.enabledPaymentMethods,
        }));
      }
    } catch {
      const saved = localStorage.getItem('systemSettings');
      if (saved) {
        try { setSettings(prev => ({ ...prev, ...JSON.parse(saved) })); } catch {}
      }
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleGatewayChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      paymentGateway: { ...prev.paymentGateway, [field]: value }
    }));
  };

  const togglePaymentMethod = (method) => {
    setSettings(prev => {
      const has = prev.enabledPaymentMethods.includes(method);
      let next = has
        ? prev.enabledPaymentMethods.filter(m => m !== method)
        : [...prev.enabledPaymentMethods, method];
      if (next.length === 0) next = [method];
      return { ...prev, enabledPaymentMethods: next };
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      alert('Configuracoes salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuracoes:', error);
      alert('Erro ao salvar configuracoes');
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'delivery': return '🚚';
      case 'payment': return '💳';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getStatusIcon = (read) => {
    return read ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: notifications.length,
    read: notifications.filter(n => n.read).length,
    unread: notifications.filter(n => !n.read).length,
    byType: {
      order: notifications.filter(n => n.type === 'order').length,
      delivery: notifications.filter(n => n.type === 'delivery').length,
      payment: notifications.filter(n => n.type === 'payment').length,
      system: notifications.filter(n => n.type === 'system').length
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Notificações</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Lidas</h4>
          <div className="value" style={{ color: '#10b981' }}>{stats.read}</div>
        </div>
        <div className="stat-card">
          <h4>Não Lidas</h4>
          <div className="value" style={{ color: '#ef4444' }}>{stats.unread}</div>
        </div>
        <div className="stat-card">
          <h4>📦 Pedidos</h4>
          <div className="value">{stats.byType.order}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Configurações Gerais */}
        <div className="card">
          <div className="card-header">
            <h3>
              <SettingsIcon size={20} style={{ marginRight: '0.5rem' }} />
              Configurações Gerais
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
                <Bell size={16} />
                Notificações Push
              </label>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 1.5rem' }}>
                Habilitar notificações push para usuários
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                />
                <SettingsIcon size={16} />
                Modo Manutenção
              </label>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 1.5rem' }}>
                Colocar sistema em modo manutenção
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                />
                <Clock size={16} />
                Backup Automático
              </label>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 1.5rem' }}>
                Realizar backup automático dos dados
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                />
                <Mail size={16} />
                Alertas por Email
              </label>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 1.5rem' }}>
                Enviar alertas importantes por email
              </p>
            </div>
          </div>
        </div>

        {/* Configurações Financeiras */}
        <div className="card">
          <div className="card-header">
            <h3>
              <Percent size={20} style={{ marginRight: '0.5rem' }} />
              Configurações Financeiras
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="companyFeePercentage">
                <Building2 size={16} style={{ marginRight: '0.5rem' }} />
                % Taxa das Empresas
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  id="companyFeePercentage"
                  name="companyFeePercentage"
                  value={settings.companyFeePercentage}
                  onChange={(e) => handleSettingChange('companyFeePercentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100px',
                    padding: '0.625rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#667eea' }}>
                  %
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Percentual cobrado das empresas sobre cada transação
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="deliverymanFeePercentage">
                <User size={16} style={{ marginRight: '0.5rem' }} />
                % Taxa dos Entregadores
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  id="deliverymanFeePercentage"
                  name="deliverymanFeePercentage"
                  value={settings.deliverymanFeePercentage}
                  onChange={(e) => handleSettingChange('deliverymanFeePercentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100px',
                    padding: '0.625rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#8b5cf6' }}>
                  %
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Percentual cobrado dos entregadores sobre cada entrega
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="platformFeePercentage">
                <Car size={16} style={{ marginRight: '0.5rem' }} />
                % Taxa da Plataforma (Corridas)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  id="platformFeePercentage"
                  name="platformFeePercentage"
                  value={settings.platformFeePercentage}
                  onChange={(e) => handleSettingChange('platformFeePercentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100px',
                    padding: '0.625rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f59e0b' }}>
                  %
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Percentual retido pela plataforma sobre as corridas (o motorista recebe o restante)
              </p>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '1.5rem' }}>💡</div>
              <div>
                <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                  Exemplo de Cálculo
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Pedido de R$100,00: Empresa paga R${settings.companyFeePercentage},00 e Entregador recebe R${(100 - settings.deliverymanFeePercentage).toFixed(2)}. Corrida de R$100,00: Motorista recebe R${(100 - settings.platformFeePercentage).toFixed(2)}
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={saveSettings}
              disabled={saving}
              style={{ marginTop: '1rem' }}
            >
              {saving ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <>
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gateway de Pagamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>
              <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
              Formas de Pagamento
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ALL_PAYMENT_METHODS.map(m => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.enabledPaymentMethods.includes(m.value)}
                  onChange={() => togglePaymentMethod(m.value)}
                />
                {m.label}
              </label>
            ))}
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
              Formas disponíveis para clientes escolherem nos pedidos e corridas.
              Formas desabilitadas não disparam cobranças no gateway.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>
              <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
              Gateway de Pagamentos
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
            <div className="form-group">
              <label htmlFor="gatewayProvider">Provedor</label>
              <select
                id="gatewayProvider"
                value={settings.paymentGateway.provider}
                onChange={(e) => handleGatewayChange('provider', e.target.value)}
              >
                {GATEWAY_PROVIDERS.map(gp => <option key={gp.value} value={gp.value}>{gp.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gatewayMode">Modo</label>
              <select
                id="gatewayMode"
                value={settings.paymentGateway.mode}
                onChange={(e) => handleGatewayChange('mode', e.target.value)}
              >
                <option value="sandbox">Sandbox (testes)</option>
                <option value="production">Produção</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Em sandbox as cobranças retornam IDs fictícios sem chamar o gateway.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="merchantId">Merchant ID</label>
              <input
                type="text"
                id="merchantId"
                value={settings.paymentGateway.merchantId}
                onChange={(e) => handleGatewayChange('merchantId', e.target.value)}
                placeholder="Identificação do lojista no gateway"
              />
            </div>

            <div className="form-group">
              <label htmlFor="merchantKey">Merchant Key</label>
              <input
                type="password"
                id="merchantKey"
                value={settings.paymentGateway.merchantKey}
                onChange={(e) => handleGatewayChange('merchantKey', e.target.value)}
                placeholder="Chave de autenticação"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <input
                type="password"
                id="apiKey"
                value={settings.paymentGateway.apiKey}
                onChange={(e) => handleGatewayChange('apiKey', e.target.value)}
                placeholder="Chave de API"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gatewayToken">Token</label>
              <input
                type="password"
                id="gatewayToken"
                value={settings.paymentGateway.token}
                onChange={(e) => handleGatewayChange('token', e.target.value)}
                placeholder="Token de acesso"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="webhookUrl">URL de Webhook (notificações do gateway)</label>
              <input
                type="url"
                id="webhookUrl"
                value={settings.paymentGateway.webhookUrl}
                onChange={(e) => handleGatewayChange('webhookUrl', e.target.value)}
                placeholder="https://..."
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Usada como postback_url nas cobranças de cartão (crédito/débito).
              </p>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.paymentGateway.splitEnabled}
                  onChange={(e) => handleGatewayChange('splitEnabled', e.target.checked)}
                />
                Habilitar Split de Pagamento
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Divide os recebimentos entre empresa, entregador e plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Notificações */}
      <div className="card">
        <div className="card-header">
          <h3>
            <Bell size={20} style={{ marginRight: '0.5rem' }} />
            Últimas Notificações
          </h3>
        </div>

        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {loading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Nenhuma notificação encontrada
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: notification.read ? '#f9fafb' : 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{getNotificationIcon(notification.type)}</span>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {notification.title || 'Sem titulo'}
                    </div>
                  </div>
                  {getStatusIcon(notification.read)}
                </div>
                
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  marginBottom: '0.5rem',
                  lineHeight: '1.4'
                }}>
                  {notification.message || notification.target || 'Sem mensagem'}
                </div>
                
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {notification.target && (
                        <>
                          <User size={12} />
                          {notification.target}
                        </>
                      )}
                    </div>
                    <div>{formatDate(notification.createdAt)}</div>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
