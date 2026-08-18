import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, Building2, User, Percent } from 'lucide-react';
import { paymentService } from '../services/api';
import DataTable from '../components/DataTable';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    companyFeePercentage: 15,
    deliverymanFeePercentage: 10
  });

  useEffect(() => {
    loadPayments();
    loadSettings();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentService.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        localStorage.removeItem('systemSettings');
      }
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

  const columns = [
    {
      key: '_id',
      title: 'ID',
      render: (id) => (
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.875rem',
          color: '#667eea',
          fontWeight: '600'
        }}>
          #{id}
        </div>
      )
    },
    {
      key: 'orderId',
      title: 'Pedido',
      render: (orderId) => (
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.875rem',
          color: '#9ca3af'
        }}>
          {orderId || 'N/A'}
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Cliente',
      render: (customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} color="#9ca3af" />
          {customer || 'N/A'}
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Valor Bruto',
      render: (amount) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={14} color="#6b7280" />
          <span style={{ fontWeight: '600', color: '#6b7280' }}>
            R$ {Number(amount || 0).toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'commission',
      title: 'Comissão',
      render: (commission, payment) => {
        const commissionAmount = (payment.amount || 0) * (settings.companyFeePercentage / 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={14} color="#f59e0b" />
            <span style={{ fontWeight: '600', color: '#f59e0b' }}>
              R$ {commissionAmount.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              ({settings.companyFeePercentage}%)
            </span>
          </div>
        );
      }
    },
    {
      key: 'netAmount',
      title: 'Valor Líquido',
      render: (netAmount, payment) => {
        const commissionAmount = (payment.amount || 0) * (settings.companyFeePercentage / 100);
        const netValue = (payment.amount || 0) - commissionAmount;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={14} color="#10b981" />
            <span style={{ fontWeight: '600', color: '#10b981' }}>
              R$ {netValue.toFixed(2)}
            </span>
          </div>
        );
      }
    },
    {
      key: 'method',
      title: 'Método',
      render: (method) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{getMethodIcon(method)}</span>
          {getMethodText(method)}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span className={`status-badge ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      )
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

  // Cálculo das estatísticas financeiras
  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalGrossAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCommissionAmount = completedPayments.reduce((sum, p) => sum + ((p.amount || 0) * (settings.companyFeePercentage / 100)), 0);
  const totalNetAmount = totalGrossAmount - totalCommissionAmount;

  const stats = {
    total: payments.length,
    completed: completedPayments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalGrossAmount,
    totalCommissionAmount,
    totalNetAmount,
    byMethod: {
      credit_card: payments.filter(p => p.method === 'credit_card').length,
      debit_card: payments.filter(p => p.method === 'debit_card').length,
      pix: payments.filter(p => p.method === 'pix').length,
      cash: payments.filter(p => p.method === 'cash').length
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Pagamentos</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Concluídos</h4>
          <div className="value" style={{ color: '#10b981' }}>{stats.completed}</div>
        </div>
        <div className="stat-card">
          <h4>Pendentes</h4>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h4>Total Arrecadado</h4>
          <div className="value" style={{ color: '#10b981' }}>
            R$ {stats.totalNetAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Cards Financeiros Detalhados */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
          <h4 style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} />
            Valor Bruto Total
          </h4>
          <div className="value" style={{ color: '#6b7280', fontSize: '1.5rem' }}>
            R$ {stats.totalGrossAmount.toFixed(2)}
          </div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)' }}>
          <h4 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={16} />
            Comissão Total ({settings.companyFeePercentage}%)
          </h4>
          <div className="value" style={{ color: '#92400e', fontSize: '1.5rem' }}>
            R$ {stats.totalCommissionAmount.toFixed(2)}
          </div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)' }}>
          <h4 style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} />
            Valor Líquido Total
          </h4>
          <div className="value" style={{ color: '#065f46', fontSize: '1.5rem' }}>
            R$ {stats.totalNetAmount.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem' }}>💵</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Dinheiro</div>
          <div style={{ fontWeight: '600' }}>{stats.byMethod.cash}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
            Pagamentos Detalhados
          </h3>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>💳</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cartão Crédito</div>
            <div style={{ fontWeight: '600' }}>{stats.byMethod.credit_card}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>💳</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cartão Débito</div>
            <div style={{ fontWeight: '600' }}>{stats.byMethod.debit_card}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>📱</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>PIX</div>
            <div style={{ fontWeight: '600' }}>{stats.byMethod.pix}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>💵</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Dinheiro</div>
            <div style={{ fontWeight: '600' }}>{stats.byMethod.cash}</div>
          </div>
        </div>

        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum pagamento encontrado"
        />
      </div>
    </div>
  );
};

export default Payments;
