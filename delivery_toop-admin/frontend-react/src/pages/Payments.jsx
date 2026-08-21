import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, Building2, User, Percent, Truck } from 'lucide-react';
import { orderService, settingsService } from '../services/api';
import DataTable from '../components/DataTable';

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    companyFeePercentage: 5,
    deliverymanFeePercentage: 2
  });

  useEffect(() => {
    loadOrders();
    loadSettings();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders({ limit: 500, status: 'delivered' });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(prev => ({ ...prev, companyFeePercentage: data.companyFeePercentage ?? prev.companyFeePercentage, deliverymanFeePercentage: data.deliverymanFeePercentage ?? prev.deliverymanFeePercentage }));
      }
    } catch {
      const saved = localStorage.getItem('systemSettings');
      if (saved) { try { setSettings(prev => ({ ...prev, ...JSON.parse(saved) })); } catch {} }
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return '💳';
      case 'debit_card': return '💳';
      case 'pix': return '📱';
      case 'cash': return '💵';
      default: return '💰';
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'credit_card': return 'Cartão Crédito';
      case 'debit_card': return 'Cartão Débito';
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      default: return method || 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-active';
      case 'pending': return 'status-inactive';
      case 'failed': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status || 'Pendente';
    }
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

  const calcProductCommission = (o) => (o.subtotal || 0) * (settings.companyFeePercentage / 100);
  const calcDeliveryCommission = (o) => (o.deliveryFee || 0) * (settings.deliverymanFeePercentage / 100);
  const calcStoreEarnings = (o) => (o.subtotal || 0) - calcProductCommission(o);
  const calcDeliverymanEarnings = (o) => (o.deliveryFee || 0) - calcDeliveryCommission(o);

  const columns = [
    {
      key: 'orderNumber',
      title: 'Pedido',
      render: (val) => (
        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#667eea', fontWeight: '600' }}>
          #{val || 'N/A'}
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Cliente',
      render: (customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} color="#9ca3af" />
          {customer?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'subtotal',
      title: 'Produtos',
      render: (val) => (
        <span style={{ fontWeight: '600', color: '#6b7280' }}>R$ {Number(val || 0).toFixed(2)}</span>
      )
    },
    {
      key: 'deliveryFee',
      title: 'Entrega',
      render: (val) => (
        <span style={{ fontWeight: '600', color: '#8b5cf6' }}>R$ {Number(val || 0).toFixed(2)}</span>
      )
    },
    {
      key: 'subtotal',
      title: `Comissao Loja (${settings.companyFeePercentage}%)`,
      render: (_val, order) => (
        <span style={{ fontWeight: '600', color: '#f59e0b' }}>R$ {calcProductCommission(order).toFixed(2)}</span>
      )
    },
    {
      key: 'deliveryFee',
      title: `Comissao Entrega (${settings.deliverymanFeePercentage}%)`,
      render: (_val, order) => (
        <span style={{ fontWeight: '600', color: '#f59e0b' }}>R$ {calcDeliveryCommission(order).toFixed(2)}</span>
      )
    },
    {
      key: 'subtotal',
      title: 'Loja Recebe',
      render: (_val, order) => (
        <span style={{ fontWeight: '600', color: '#10b981' }}>R$ {calcStoreEarnings(order).toFixed(2)}</span>
      )
    },
    {
      key: 'deliveryFee',
      title: 'Entregador Recebe',
      render: (_val, order) => (
        <span style={{ fontWeight: '600', color: '#10b981' }}>R$ {calcDeliverymanEarnings(order).toFixed(2)}</span>
      )
    },
    {
      key: 'paymentMethod',
      title: 'Metodo',
      render: (method) => {
        const map = { credit_card: 'Credito', debit_card: 'Debito', pix: 'PIX', cash: 'Dinheiro' };
        return map[method] || method || 'N/A';
      }
    },
    {
      key: 'createdAt',
      title: 'Data',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} color="#9ca3af" />
          {formatDate(date)}
        </div>
      )
    }
  ];

  const totalProductCommission = orders.reduce((sum, o) => sum + calcProductCommission(o), 0);
  const totalDeliveryCommission = orders.reduce((sum, o) => sum + calcDeliveryCommission(o), 0);
  const totalPlatformRevenue = totalProductCommission + totalDeliveryCommission;
  const totalStorePayout = orders.reduce((sum, o) => sum + calcStoreEarnings(o), 0);
  const totalDeliverymanPayout = orders.reduce((sum, o) => sum + calcDeliverymanEarnings(o), 0);

  const stats = {
    total: orders.length,
    totalGross: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    totalProductCommission,
    totalDeliveryCommission,
    totalPlatformRevenue,
    totalStorePayout,
    totalDeliverymanPayout,
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Pedidos Entregues</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Faturamento Bruto</h4>
          <div className="value" style={{ color: '#6b7280' }}>R$ {stats.totalGross.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h4>Receita Plataforma</h4>
          <div className="value" style={{ color: '#10b981' }}>R$ {stats.totalPlatformRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)' }}>
          <h4 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={16} />
            Comissao Produtos ({settings.companyFeePercentage}%)
          </h4>
          <div className="value" style={{ color: '#92400e', fontSize: '1.5rem' }}>
            R$ {stats.totalProductCommission.toFixed(2)}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)' }}>
          <h4 style={{ color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={16} />
            Comissao Entregas ({settings.deliverymanFeePercentage}%)
          </h4>
          <div className="value" style={{ color: '#5b21b6', fontSize: '1.5rem' }}>
            R$ {stats.totalDeliveryCommission.toFixed(2)}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)' }}>
          <h4 style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} />
            Lojas Recebem
          </h4>
          <div className="value" style={{ color: '#065f46', fontSize: '1.5rem' }}>
            R$ {stats.totalStorePayout.toFixed(2)}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)' }}>
          <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={16} />
            Entregadores Recebem
          </h4>
          <div className="value" style={{ color: '#1e40af', fontSize: '1.5rem' }}>
            R$ {stats.totalDeliverymanPayout.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
            Pedidos Detalhados
          </h3>
          <button className="btn btn-secondary" onClick={loadOrders}>Atualizar</button>
        </div>

        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum pedido entregue encontrado"
        />
      </div>
    </div>
  );
};

export default Payments;
