import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, Package, MapPin, Phone, User, LogOut } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = {
  pending: 'Novo Pedido',
  confirmed: 'Aceito',
  preparing: 'Em Preparação',
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

const PAYMENT_LABELS = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  money: 'Dinheiro',
  pix: 'PIX',
  CARD: 'Cartão',
  MONEY: 'Dinheiro',
  PIX: 'PIX',
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0);

const formatTime = (d) => {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  return `${Math.floor(m / 60)}h${m % 60}min`;
};

export default function Painel() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState('ongoing');
  const [updating, setUpdating] = useState(false);
  const { user, logout, token } = useAuth();

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const r = await orderService.getOrders({ limit: 200 });
      const d = Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
      setOrders(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadDetail = useCallback(async (id) => {
    if (!id || !token) { setSelected(null); return; }
    setLoadingDetail(true);
    try {
      const d = await orderService.getOrderById(id);
      setSelected(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  }, [token]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { const i = setInterval(loadOrders, 30000); return () => clearInterval(i); }, [loadOrders]);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId, loadDetail]);

  const ongoing = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
  const ended = orders.filter(o => o.status === 'cancelled' || o.status === 'delivered');
  const list = tab === 'ongoing' ? ongoing : ended;

  const changeStatus = async (id, status) => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, status);
      await loadOrders();
      await loadDetail(id);
    } catch (e) {
      alert('Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancelar este pedido?')) return;
    setUpdating(true);
    try {
      await orderService.cancelOrder(id);
      await loadOrders();
      setSelectedId(null);
      setSelected(null);
    } catch (e) {
      alert('Erro ao cancelar');
    } finally {
      setUpdating(false);
    }
  };

  const renderActions = () => {
    if (!selected || selected.status === 'cancelled' || selected.status === 'delivered') return null;
    const id = selected._id;
    const s = selected.status;
    const btn = (cls, label, icon, onClick) => (
      <button key={label} className={`pm-btn ${cls}`} disabled={updating} onClick={onClick}>
        {icon} {label}
      </button>
    );
    const icons = {
      check: <CheckCircle size={16} />,
      package: <Package size={16} />,
      x: <XCircle size={16} />,
    };

    const actions = [];
    if (s === 'pending') actions.push(btn('pm-green', 'Aceitar', icons.check, () => changeStatus(id, 'confirmed')));
    if (s === 'confirmed') actions.push(btn('pm-orange', 'Iniciar Preparação', icons.package, () => changeStatus(id, 'preparing')));
    if (s === 'preparing') actions.push(btn('pm-yellow', 'Marcar Pronto', icons.check, () => changeStatus(id, 'ready')));
    if (s === 'ready') actions.push(btn('pm-blue', 'Enviar Entrega', icons.package, () => changeStatus(id, 'delivering')));
    if (s === 'delivering') actions.push(btn('pm-green', 'Finalizar', icons.check, () => changeStatus(id, 'delivered')));
    if (s !== 'pending') actions.push(btn('pm-red', 'Cancelar', icons.x, () => cancelOrder(id)));

    return <div className="pm-actions">{actions}</div>;
  };

  if (loading) return <div className="pm-loading"><div className="spinner" /></div>;

  return (
    <div className="pm-root">
      <header className="pm-topbar">
        <div className="pm-topbar-left">
          <h1>Toop Delivery</h1>
          <span className="pm-topbar-sub">Painel de Pedidos</span>
        </div>
        <div className="pm-topbar-right">
          <span className="pm-topbar-user">{user?.name}</span>
          <button className="pm-topbar-logout" onClick={logout}><LogOut size={18} /></button>
        </div>
      </header>

      <div className="pm-toolbar">
        <div className="pm-tabs">
          <button className={`pm-tab ${tab === 'ongoing' ? 'active' : ''}`}
            onClick={() => { setTab('ongoing'); setSelectedId(null); setSelected(null); }}>
            Em Andamento ({ongoing.length})
          </button>
          <button className={`pm-tab ${tab === 'ended' ? 'active' : ''}`}
            onClick={() => { setTab('ended'); setSelectedId(null); setSelected(null); }}>
            Finalizados ({ended.length})
          </button>
        </div>
        <button className="pm-refresh" onClick={loadOrders}><RefreshCw size={16} /> Atualizar</button>
      </div>

      <div className="pm-body">
        <div className="pm-cards">
          {list.length === 0 && <div className="pm-empty">Nenhum pedido</div>}
          {list.map(o => (
            <div key={o._id} className={`pm-card ${selectedId === o._id ? 'sel' : ''}`}
              onClick={() => setSelectedId(o._id)}>
              <div className="pm-card-top">
                <span className="pm-card-name">{o.customer?.name || o.customer?.person?.[0]?.name || 'Cliente'}</span>
                <span className="pm-card-time"><Clock size={11} /> {formatTime(o.createdAt)}</span>
              </div>
              <div className="pm-card-bot">
                <span className="pm-badge" style={{ background: STATUS_COLORS[o.status] }}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
                <span className="pm-card-total">{formatCurrency(o.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pm-detail">
          {!selected ? (
            <div className="pm-detail-empty"><Package size={48} color="#d1d5db" /><p>Selecione um pedido</p></div>
          ) : loadingDetail ? (
            <div className="pm-loading"><div className="spinner" /></div>
          ) : (
            <>
              <div className="pm-detail-head">
                <h2>Pedido #{selected.orderNumber}</h2>
                <span className="pm-badge lg" style={{ background: STATUS_COLORS[selected.status] }}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>

              <div className="pm-grid">
                <div className="pm-section">
                  <h4><User size={13} /> Cliente</h4>
                  <p>{selected.customer?.name || selected.customer?.person?.[0]?.name || 'N/A'}</p>
                  {selected.customer?.person?.[0]?.phone && (
                    <p className="pm-sub"><Phone size={11} /> {selected.customer.person[0].phone}</p>
                  )}
                </div>
                <div className="pm-section">
                  <h4><MapPin size={13} /> Endereço</h4>
                  {selected.deliveryAddress ? (
                    <p>{selected.deliveryAddress.street}{selected.deliveryAddress.number ? `, ${selected.deliveryAddress.number}` : ''}{selected.deliveryAddress.neighborhood ? ` - ${selected.deliveryAddress.neighborhood}` : ''}{selected.deliveryAddress.city ? ` - ${selected.deliveryAddress.city}` : ''}</p>
                  ) : <p className="pm-sub">Não informado</p>}
                </div>
                <div className="pm-section">
                  <h4>Pagamento</h4>
                  <p>{PAYMENT_LABELS[selected.paymentMethod] || selected.paymentMethod || 'N/A'}</p>
                  <p className="pm-sub">Status: {selected.paymentStatus || 'N/A'}</p>
                </div>
                {selected.company && (
                  <div className="pm-section">
                    <h4>Empresa</h4>
                    <p>{selected.company.name}</p>
                  </div>
                )}
              </div>

              <div className="pm-section" style={{ marginTop: '1rem' }}>
                <h4>Itens</h4>
                <div className="pm-items">
                  {selected.items?.map((it, i) => (
                    <div key={i} className="pm-item">
                      <span className="pm-item-name">{it.name}</span>
                      <span className="pm-item-qty">x{it.quantity}</span>
                      <span className="pm-item-price">{formatCurrency(it.total || it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pm-totals">
                <div className="pm-total-row"><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
                <div className="pm-total-row"><span>Entrega</span><span>{formatCurrency(selected.deliveryFee)}</span></div>
                {selected.discount > 0 && <div className="pm-total-row"><span>Desconto</span><span>-{formatCurrency(selected.discount)}</span></div>}
                <div className="pm-total-row tot"><span>Total</span><span>{formatCurrency(selected.total)}</span></div>
              </div>

              {selected.notes && <div className="pm-section" style={{ marginTop: '0.75rem' }}><h4>Obs</h4><p>{selected.notes}</p></div>}

              {renderActions()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
