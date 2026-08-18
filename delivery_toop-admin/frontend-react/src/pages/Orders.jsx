import React, { useState, useEffect } from 'react';
import { ShoppingCart, Building2, User, Calendar, DollarSign } from 'lucide-react';
import { orderService } from '../services/api';
import DataTable from '../components/DataTable';

const STATUS_MAP = {
  pending: 'Pendente',
  confirmed: 'Aceito',
  preparing: 'Em Preparação',
  ready: 'Pronto',
  delivering: 'A Caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLOR = {
  pending: '#f59e0b',
  confirmed: '#6366f1',
  preparing: '#f97316',
  ready: '#f97316',
  delivering: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await orderService.getOrders();
      const data = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'orderNumber',
      title: 'Pedido',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#667eea', fontWeight: '600' }}>
          #{val}
        </span>
      )
    },
    {
      key: 'company',
      title: 'Empresa',
      render: (company) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={14} color="#667eea" />
          {company?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Cliente',
      render: (customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} color="#9ca3af" />
          {customer?.name || customer?.person?.[0]?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'total',
      title: 'Valor',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={14} color="#10b981" />
          <span style={{ fontWeight: '600', color: '#10b981' }}>
            R$ {Number(value || 0).toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'white',
          background: STATUS_COLOR[status] || '#6b7280',
        }}>
          {STATUS_MAP[status] || status || 'Pendente'}
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

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total de Pedidos</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Entregues</h4>
          <div className="value" style={{ color: '#10b981' }}>{stats.delivered}</div>
        </div>
        <div className="stat-card">
          <h4>Pendentes</h4>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h4>Cancelados</h4>
          <div className="value" style={{ color: '#ef4444' }}>{stats.cancelled}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
            Pedidos
          </h3>
        </div>

        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum pedido encontrado"
        />
      </div>
    </div>
  );
};

export default Orders;
