import React, { useState, useEffect, useMemo } from 'react';
import { Users, Building2, ShoppingCart, Truck, TrendingUp, Clock, XCircle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';
import { orderService, companyService } from '../services/api';

const STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em Preparo',
  ready: 'Pronto',
  delivering: 'A Caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLORS = {
  pending: '#3b82f6',
  confirmed: '#6366f1',
  preparing: '#f59e0b',
  ready: '#f97316',
  delivering: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: '7 dias' },
  { value: '30days', label: '30 dias' },
  { value: 'all', label: 'Todos' },
];

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const formatTime = (d) => {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h${m % 60}min atrás`;
  return `${Math.floor(h / 24)}d atrás`;
};

const getPeriodDates = (period) => {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: now.toISOString() };
    case '7days':
      start.setDate(now.getDate() - 7);
      return { start: start.toISOString(), end: now.toISOString() };
    case '30days':
      start.setDate(now.getDate() - 30);
      return { start: start.toISOString(), end: now.toISOString() };
    default:
      return { start: null, end: null };
  }
};

const Dashboard = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, companiesData] = await Promise.all([
        orderService.getOrders({ limit: 1000 }),
        companyService.getCompanies(),
      ]);
      const orderList = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
      const companyList = Array.isArray(companiesData?.data) ? companiesData.data : Array.isArray(companiesData) ? companiesData : [];
      setAllOrders(orderList);
      setCompanies(companyList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (period === 'all') return allOrders;
    const { start } = getPeriodDates(period);
    const startDate = new Date(start);
    return allOrders.filter(o => new Date(o.createdAt) >= startDate);
  }, [allOrders, period]);

  const stats = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered');
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled');
    const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const avgTicket = delivered.length > 0 ? totalRevenue / delivered.length : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);

    const statusCounts = {};
    Object.keys(STATUS_LABELS).forEach(s => { statusCounts[s] = 0; });
    filteredOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    return {
      total: filteredOrders.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      totalRevenue,
      avgTicket,
      todayOrders: todayOrders.length,
      statusCounts,
    };
  }, [filteredOrders, allOrders]);

  const topCompanies = useMemo(() => {
    const companyMap = {};
    const delivered = filteredOrders.filter(o => o.status === 'delivered');
    delivered.forEach(o => {
      const cid = typeof o.company === 'object' ? o.company?._id : o.company;
      const cname = typeof o.company === 'object' ? o.company?.name : companies.find(c => c._id === cid)?.name || 'Loja';
      if (!companyMap[cid]) companyMap[cid] = { name: cname, total: 0, count: 0 };
      companyMap[cid].total += o.total || 0;
      companyMap[cid].count += 1;
    });
    return Object.values(companyMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredOrders, companies]);

  const recentOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [filteredOrders]);

  const maxStatusCount = Math.max(...Object.values(stats.statusCounts), 1);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Visão geral da plataforma
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRight: '1px solid #e5e7eb',
                  background: period === p.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: period === p.value ? 'white' : '#6b7280',
                  fontWeight: period === p.value ? 600 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={20} color="#3b82f6" />
            </div>
            <h4 style={{ margin: 0 }}>Pedidos</h4>
          </div>
          <div className="value" style={{ color: '#3b82f6' }}>{stats.total}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
            <h4 style={{ margin: 0 }}>Entregues</h4>
          </div>
          <div className="value" style={{ color: '#10b981' }}>{stats.delivered}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#f59e0b" />
            </div>
            <h4 style={{ margin: 0 }}>Receita</h4>
          </div>
          <div className="value" style={{ color: '#f59e0b', fontSize: '1.5rem' }}>{formatCurrency(stats.totalRevenue)}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="#8b5cf6" />
            </div>
            <h4 style={{ margin: 0 }}>Ticket Médio</h4>
          </div>
          <div className="value" style={{ color: '#8b5cf6', fontSize: '1.5rem' }}>{formatCurrency(stats.avgTicket)}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#0ea5e9" />
            </div>
            <h4 style={{ margin: 0 }}>Pedidos Hoje</h4>
          </div>
          <div className="value" style={{ color: '#0ea5e9' }}>{stats.todayOrders}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={20} color="#ef4444" />
            </div>
            <h4 style={{ margin: 0 }}>Cancelados</h4>
          </div>
          <div className="value" style={{ color: '#ef4444' }}>{stats.cancelled}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Orders by Status */}
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={20} style={{ marginRight: '0.5rem' }} /> Pedidos por Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '110px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
                  {STATUS_LABELS[status]}
                </span>
                <div style={{ flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / maxStatusCount) * 100}%`,
                    height: '100%',
                    background: STATUS_COLORS[status],
                    borderRadius: '6px',
                    transition: 'width 0.5s ease',
                    minWidth: count > 0 ? '4px' : '0',
                  }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="card">
          <div className="card-header">
            <h3><Building2 size={20} style={{ marginRight: '0.5rem' }} /> Top Lojas</h3>
          </div>
          {topCompanies.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Nenhum pedido entregue</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topCompanies.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', background: '#f9fafb', borderRadius: '8px',
                  border: '1px solid #f3f4f6',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: i === 0 ? '#fef3c7' : i === 1 ? '#e5e7eb' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? '#d97706' : i === 1 ? '#6b7280' : '#9ca3af',
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1f2937' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.count} pedidos</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3><Clock size={20} style={{ marginRight: '0.5rem' }} /> Pedidos Recentes</h3>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Nenhum pedido encontrado</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Loja</th>
                <th>Status</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#667eea' }}>#{o.orderNumber || 'N/A'}</td>
                  <td>{o.customer?.name || 'N/A'}</td>
                  <td>{typeof o.company === 'object' ? o.company?.name : 'Loja'}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '9999px',
                      fontSize: '0.7rem', fontWeight: 600, color: 'white',
                      background: STATUS_COLORS[o.status] || '#9ca3af',
                    }}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(o.total)}</td>
                  <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
