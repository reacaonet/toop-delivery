import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, XCircle } from 'lucide-react';
import { orderService, companyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const PAYMENT_STATUS_LABELS = {
  pending: 'Aguardando',
  paid: 'Pago',
  failed: 'Erro',
  refunded: 'Estornado',
};

const PAYMENT_STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#10b981',
  failed: '#ef4444',
  refunded: '#6366f1',
};

const CANCEL_BY_LABELS = {
  customer: 'Cliente',
  store: 'Loja',
  admin: 'Admin',
  deliveryman: 'Entregador',
  system: 'Sistema',
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const isCancellable = (status) => ['pending', 'confirmed', 'preparing'].includes(status);

const Orders = () => {
  const { user } = useAuth();
  const storeCompanyId = user?.role === 'store'
    ? (typeof user.company === 'object' ? user.company?._id : user.company) || null
    : null;
  const isAdminUser = !user || user.role === 'admin' || user.role === 'manager';

  const [allOrders, setAllOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState(storeCompanyId || '');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, companiesData] = await Promise.all([
        orderService.getOrders({ limit: 1000 }),
        isAdminUser ? companyService.getCompanies() : Promise.resolve(null),
      ]);
      const orderList = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
      setAllOrders(orderList);
      if (companiesData) {
        setCompanies(Array.isArray(companiesData?.data) ? companiesData.data : Array.isArray(companiesData) ? companiesData : []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let list = allOrders;
    if (storeCompanyId) {
      list = list.filter(o => (typeof o.company === 'object' ? o.company?._id : o.company) === storeCompanyId);
    } else if (companyFilter) {
      list = list.filter(o => (typeof o.company === 'object' ? o.company?._id : o.company) === companyFilter);
    }
    if (statusFilter) {
      list = list.filter(o => o.status === statusFilter);
    }
    return list;
  }, [allOrders, companyFilter, statusFilter, storeCompanyId]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(start, start + limit);
  }, [filteredOrders, page]);

  useEffect(() => { setPage(1); }, [statusFilter, companyFilter]);

  const openCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReason('');
  };

  const submitCancel = async () => {
    if (!cancelModalOrder) return;
    if (!cancelReason.trim()) {
      alert('Informe o motivo do cancelamento');
      return;
    }
    setCancelling(true);
    try {
      await orderService.cancelOrder(cancelModalOrder._id, { reason: cancelReason.trim() });
      setCancelModalOrder(null);
      setCancelReason('');
      loadData();
    } catch (error) {
      alert(error?.response?.data?.error || error?.message || 'Erro ao cancelar pedido');
    } finally {
      setCancelling(false);
    }
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
          <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: 700 }}>Pedidos</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {isAdminUser && (
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', minWidth: 180 }}
          >
            <option value="">Todas as lojas</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.name || c._id}</option>
            ))}
          </select>
        )}
      </div>

      {paginatedOrders.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
          Nenhum pedido encontrado
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Loja</th>
                <th>Status</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Data</th>
                <th style={{ minWidth: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(o => {
                const companyName = typeof o.company === 'object' ? o.company?.name : companies.find(c => c._id === o.company)?.name || 'Loja';
                const cancellable = isCancellable(o.status) && (storeCompanyId || isAdminUser);
                return (
                  <tr key={o._id} style={{ opacity: o.status === 'cancelled' ? 0.7 : 1 }}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#667eea' }}>#{o.orderNumber || 'N/A'}</td>
                    <td>{o.customer?.name || 'N/A'}</td>
                    <td>{companyName}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px',
                        fontSize: '0.7rem', fontWeight: 600, color: 'white',
                        background: STATUS_COLORS[o.status] || '#9ca3af',
                      }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                      {o.cancelReason && (
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
                          {CANCEL_BY_LABELS[o.cancelledBy] || o.cancelledBy}: {o.cancelReason}
                        </div>
                      )}
                      {o.paymentStatus === 'refunded' && (
                        <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: 2 }}>Estornado</div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.65rem', fontWeight: 600, color: 'white',
                        background: PAYMENT_STATUS_COLORS[o.paymentStatus] || '#9ca3af',
                      }}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(o.total)}</td>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(o.createdAt)}</td>
                    <td>
                      {cancellable && (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => openCancelModal(o)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                Página {page} de {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {cancelModalOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 420, width: '90%', padding: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>
                Cancelar Pedido #{cancelModalOrder.orderNumber}
              </h3>
              <button
                onClick={() => setCancelModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {cancelModalOrder.paymentStatus === 'paid' && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>
                  Este pedido já foi pago. O pagamento será estornado.
                </p>
              )}
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: '0.875rem' }}>
                Motivo do cancelamento *
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Informe o motivo (obrigatório)"
                rows={3}
                style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCancelModalOrder(null)}>
                  Voltar
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={submitCancel}
                  disabled={cancelling || !cancelReason.trim()}
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
