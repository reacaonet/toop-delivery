import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Calendar, Building2, Truck, CreditCard, Filter } from 'lucide-react';
import { orderService, settingsService, deliverymanService } from '../services/api';

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

const TABS = [
  { id: 'orders', label: 'Pedidos', icon: FileText },
  { id: 'financial', label: 'Financeiro', icon: CreditCard },
  { id: 'stores', label: 'Lojas', icon: Building2 },
  { id: 'deliverymen', label: 'Entregadores', icon: Truck },
];

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0);

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const exportCSV = (headers, rows, filename) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [settings, setSettings] = useState({ companyFeePercentage: 5, deliverymanFeePercentage: 2 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, settingsData, dmData] = await Promise.all([
        orderService.getOrders({ limit: 2000 }),
        settingsService.getSettings().catch(() => null),
        deliverymanService.getDeliverymen().catch(() => []),
      ]);
      const orderList = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
      const dmList = Array.isArray(dmData?.data) ? dmData.data : Array.isArray(dmData) ? dmData : [];
      setOrders(orderList);
      setDeliverymen(dmList);
      if (settingsData) {
        setSettings(prev => ({
          ...prev,
          companyFeePercentage: settingsData.companyFeePercentage ?? prev.companyFeePercentage,
          deliverymanFeePercentage: settingsData.deliverymanFeePercentage ?? prev.deliverymanFeePercentage,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }
    if (period !== 'all' && !dateFrom && !dateTo) {
      const now = new Date();
      const start = new Date();
      if (period === 'today') start.setHours(0, 0, 0, 0);
      else if (period === '7days') start.setDate(now.getDate() - 7);
      else if (period === '30days') start.setDate(now.getDate() - 30);
      result = result.filter(o => new Date(o.createdAt) >= start);
    }
    return result;
  }, [orders, period, dateFrom, dateTo]);

  const calcCommission = (subtotal, pct) => subtotal * (pct / 100);

  // ============ REPORTS DATA ============

  const statusReport = useMemo(() => {
    const counts = {};
    const totals = {};
    Object.keys(STATUS_LABELS).forEach(s => { counts[s] = 0; totals[s] = 0; });
    filteredOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
      totals[o.status] = (totals[o.status] || 0) + (o.total || 0);
    });
    return Object.keys(STATUS_LABELS).map(s => ({
      status: s,
      label: STATUS_LABELS[s],
      count: counts[s],
      total: totals[s],
      pct: filteredOrders.length > 0 ? ((counts[s] / filteredOrders.length) * 100).toFixed(1) : 0,
    }));
  }, [filteredOrders]);

  const paymentReport = useMemo(() => {
    const methods = {};
    filteredOrders.forEach(o => {
      const m = o.paymentMethod || 'other';
      if (!methods[m]) methods[m] = { count: 0, total: 0 };
      methods[m].count += 1;
      methods[m].total += o.total || 0;
    });
    const map = { credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito', pix: 'PIX', cash: 'Dinheiro' };
    return Object.entries(methods).map(([k, v]) => ({ method: map[k] || k, ...v }));
  }, [filteredOrders]);

  const financialReport = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered');
    const totalGross = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const totalProductCommission = delivered.reduce((s, o) => s + calcCommission(o.subtotal || 0, settings.companyFeePercentage), 0);
    const totalDeliveryCommission = delivered.reduce((s, o) => s + calcCommission(o.deliveryFee || 0, settings.deliverymanFeePercentage), 0);
    const platformRevenue = totalProductCommission + totalDeliveryCommission;
    const storePayout = delivered.reduce((s, o) => s + (o.subtotal || 0) - calcCommission(o.subtotal || 0, settings.companyFeePercentage), 0);
    const dmPayout = delivered.reduce((s, o) => s + (o.deliveryFee || 0) - calcCommission(o.deliveryFee || 0, settings.deliverymanFeePercentage), 0);

    return {
      deliveredCount: delivered.length,
      totalGross,
      totalProductCommission,
      totalDeliveryCommission,
      platformRevenue,
      storePayout,
      dmPayout,
    };
  }, [filteredOrders, settings]);

  const storeReport = useMemo(() => {
    const map = {};
    filteredOrders.forEach(o => {
      const cid = typeof o.company === 'object' ? o.company?._id : o.company;
      const cname = typeof o.company === 'object' ? o.company?.name : 'Loja';
      if (!map[cid]) map[cid] = { name: cname, totalOrders: 0, deliveredOrders: 0, revenue: 0, cancelled: 0 };
      map[cid].totalOrders += 1;
      if (o.status === 'delivered') {
        map[cid].deliveredOrders += 1;
        map[cid].revenue += o.total || 0;
      }
      if (o.status === 'cancelled') map[cid].cancelled += 1;
    });
    return Object.values(map)
      .map(s => ({ ...s, avgTicket: s.deliveredOrders > 0 ? s.revenue / s.deliveredOrders : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const dmReport = useMemo(() => {
    const map = {};
    filteredOrders.filter(o => o.status === 'delivered' || o.status === 'delivering').forEach(o => {
      const did = typeof o.deliveryman === 'object' ? o.deliveryman?._id : o.deliveryman;
      if (!did) return;
      const dname = typeof o.deliveryman === 'object' ? o.deliveryman?.name : deliverymen.find(d => d._id === did)?.name || 'Entregador';
      if (!map[did]) map[did] = { name: dname, delivered: 0, earnings: 0 };
      if (o.status === 'delivered') {
        map[did].delivered += 1;
        map[did].earnings += (o.deliveryFee || 0) - calcCommission(o.deliveryFee || 0, settings.deliverymanFeePercentage);
      }
    });
    return Object.values(map).sort((a, b) => b.delivered - a.delivered);
  }, [filteredOrders, deliverymen, settings]);

  // ============ EXPORT HANDLERS ============

  const exportOrdersCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Loja', 'Status', 'Subtotal', 'Frete', 'Total', 'Pagamento', 'Data'];
    const rows = filteredOrders.map(o => [
      o.orderNumber || '',
      o.customer?.name || '',
      typeof o.company === 'object' ? o.company?.name : '',
      STATUS_LABELS[o.status] || o.status,
      (o.subtotal || 0).toFixed(2),
      (o.deliveryFee || 0).toFixed(2),
      (o.total || 0).toFixed(2),
      o.paymentMethod || '',
      formatDate(o.createdAt),
    ]);
    exportCSV(headers, rows, 'relatorio_pedidos');
  };

  const exportFinancialCSV = () => {
    const headers = ['Metrica', 'Valor'];
    const rows = [
      ['Pedidos Entregues', financialReport.deliveredCount],
      ['Faturamento Bruto', financialReport.totalGross.toFixed(2)],
      [`Comissao Produtos (${settings.companyFeePercentage}%)`, financialReport.totalProductCommission.toFixed(2)],
      [`Comissao Entregas (${settings.deliverymanFeePercentage}%)`, financialReport.totalDeliveryCommission.toFixed(2)],
      ['Receita Plataforma', financialReport.platformRevenue.toFixed(2)],
      ['Pago as Lojas', financialReport.storePayout.toFixed(2)],
      ['Pago aos Entregadores', financialReport.dmPayout.toFixed(2)],
    ];
    exportCSV(headers, rows, 'relatorio_financeiro');
  };

  const exportStoresCSV = () => {
    const headers = ['Loja', 'Pedidos Total', 'Entregues', 'Cancelados', 'Faturamento', 'Ticket Medio'];
    const rows = storeReport.map(s => [s.name, s.totalOrders, s.deliveredOrders, s.cancelled, s.revenue.toFixed(2), s.avgTicket.toFixed(2)]);
    exportCSV(headers, rows, 'relatorio_lojas');
  };

  const exportDmCSV = () => {
    const headers = ['Entregador', 'Entregas', 'Ganhos'];
    const rows = dmReport.map(d => [d.name, d.delivered, d.earnings.toFixed(2)]);
    exportCSV(headers, rows, 'relatorio_entregadores');
  };

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
          <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: 700 }}>Relatorios</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Analise detalhada da plataforma
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#6b7280" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Periodo:</span>
          </div>

          <div style={{ display: 'flex', gap: '0', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {[{ value: 'all', label: 'Todos' }, { value: 'today', label: 'Hoje' }, { value: '7days', label: '7 dias' }, { value: '30days', label: '30 dias' }].map((p) => (
              <button
                key={p.value}
                onClick={() => { setPeriod(p.value); setDateFrom(''); setDateTo(''); }}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: 'none',
                  borderRight: '1px solid #e5e7eb',
                  background: period === p.value && !dateFrom && !dateTo ? '#667eea' : 'white',
                  color: period === p.value && !dateFrom && !dateTo ? 'white' : '#6b7280',
                  fontWeight: period === p.value && !dateFrom && !dateTo ? 600 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} color="#9ca3af" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPeriod('all'); }}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem' }}
            />
            <span style={{ color: '#9ca3af' }}>ate</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPeriod('all'); }}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem' }}
            />
          </div>

          <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: 'auto' }}>
            {filteredOrders.length} pedidos encontrados
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none', borderBottom: `2px solid ${tab === t.id ? '#667eea' : 'transparent'}`,
                background: 'none', cursor: 'pointer',
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? '#667eea' : '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '-2px',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Orders */}
      {tab === 'orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3>Por Status</h3>
              <button className="btn btn-secondary" onClick={exportOrdersCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> CSV
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Qtd</th>
                  <th>%</th>
                  <th>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {statusReport.map((s) => (
                  <tr key={s.status}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s.status], display: 'inline-block' }} />
                        {s.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.count}</td>
                    <td>{s.pct}%</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Por Pagamento</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>Pedidos</th>
                  <th>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {paymentReport.map((p) => (
                  <tr key={p.method}>
                    <td style={{ fontWeight: 500 }}>{p.method}</td>
                    <td>{p.count}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(p.total)}</td>
                  </tr>
                ))}
                {paymentReport.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>Sem dados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Financial */}
      {tab === 'financial' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)' }}>
              <h4 style={{ color: '#065f46' }}>Faturamento Bruto</h4>
              <div className="value" style={{ color: '#065f46', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalGross)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)' }}>
              <h4 style={{ color: '#92400e' }}>Comissao Produtos ({settings.companyFeePercentage}%)</h4>
              <div className="value" style={{ color: '#92400e', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalProductCommission)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)' }}>
              <h4 style={{ color: '#5b21b6' }}>Comissao Entregas ({settings.deliverymanFeePercentage}%)</h4>
              <div className="value" style={{ color: '#5b21b6', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalDeliveryCommission)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #0ea5e9 100%)' }}>
              <h4 style={{ color: '#0c4a6e' }}>Receita Plataforma</h4>
              <div className="value" style={{ color: '#0c4a6e', fontSize: '1.4rem' }}>{formatCurrency(financialReport.platformRevenue)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #34d399 100%)' }}>
              <h4 style={{ color: '#065f46' }}>Pago as Lojas</h4>
              <div className="value" style={{ color: '#065f46', fontSize: '1.4rem' }}>{formatCurrency(financialReport.storePayout)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)' }}>
              <h4 style={{ color: '#1e40af' }}>Pago aos Entregadores</h4>
              <div className="value" style={{ color: '#1e40af', fontSize: '1.4rem' }}>{formatCurrency(financialReport.dmPayout)}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>Resumo Financeiro</h3>
              <button className="btn btn-secondary" onClick={exportFinancialCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> Exportar CSV
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Metrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Pedidos Entregues</td><td style={{ fontWeight: 600 }}>{financialReport.deliveredCount}</td></tr>
                <tr><td>Faturamento Bruto</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.totalGross)}</td></tr>
                <tr><td>Comissao Produtos ({settings.companyFeePercentage}%)</td><td style={{ fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(financialReport.totalProductCommission)}</td></tr>
                <tr><td>Comissao Entregas ({settings.deliverymanFeePercentage}%)</td><td style={{ fontWeight: 600, color: '#8b5cf6' }}>{formatCurrency(financialReport.totalDeliveryCommission)}</td></tr>
                <tr style={{ background: '#f0fdf4' }}><td style={{ fontWeight: 700 }}>Receita Plataforma</td><td style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(financialReport.platformRevenue)}</td></tr>
                <tr><td>Pago as Lojas</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.storePayout)}</td></tr>
                <tr><td>Pago aos Entregadores</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.dmPayout)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Stores */}
      {tab === 'stores' && (
        <div className="card">
          <div className="card-header">
            <h3><Building2 size={20} style={{ marginRight: '0.5rem' }} /> Desempenho por Loja</h3>
            <button className="btn btn-secondary" onClick={exportStoresCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          {storeReport.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Nenhum dado encontrado</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Loja</th>
                  <th>Pedidos</th>
                  <th>Entregues</th>
                  <th>Cancelados</th>
                  <th>Faturamento</th>
                  <th>Ticket Medio</th>
                </tr>
              </thead>
              <tbody>
                {storeReport.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#667eea' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.totalOrders}</td>
                    <td style={{ color: '#10b981', fontWeight: 500 }}>{s.deliveredOrders}</td>
                    <td style={{ color: '#ef4444', fontWeight: 500 }}>{s.cancelled}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(s.revenue)}</td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(s.avgTicket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Deliverymen */}
      {tab === 'deliverymen' && (
        <div className="card">
          <div className="card-header">
            <h3><Truck size={20} style={{ marginRight: '0.5rem' }} /> Desempenho dos Entregadores</h3>
            <button className="btn btn-secondary" onClick={exportDmCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          {dmReport.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Nenhum entregador com entregas</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Entregador</th>
                  <th>Entregas Realizadas</th>
                  <th>Ganhos Totais</th>
                </tr>
              </thead>
              <tbody>
                {dmReport.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#667eea' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ color: '#10b981', fontWeight: 500 }}>{d.delivered}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(d.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
