import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare, Wrench, RefreshCw, Plus, X, TrendingUp } from 'lucide-react';
import { monitorService, chatService, toolsService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Monitor = () => {
  const [tab, setTab] = useState('noc');
  const tabs = [
    { key: 'noc', label: 'Monitor (NOC)', icon: Activity },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
    { key: 'tools', label: 'Tools', icon: Wrench },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Activity size={20} style={{ marginRight: '0.5rem' }} />Monitor / Tools</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => {
            const Icon = t.icon; const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', cursor: 'pointer',
                borderRadius: '8px', border: active ? '1px solid #10b981' : '1px solid transparent',
                background: active ? '#ecfdf5' : 'transparent', color: active ? '#047857' : '#4b5563',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
              }}><Icon size={16} />{t.label}</button>
            );
          })}
        </div>
        <div style={{ padding: '1rem' }}>
          {tab === 'noc' && <NocTab />}
          {tab === 'chat' && <ChatTab />}
          {tab === 'tools' && <ToolsTab />}
        </div>
      </div>
    </div>
  );
};

const NocTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [sales, setSales] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await monitorService.listOrders({});
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    monitorService.salesLastDay().then((s) => setSales(s)).catch(console.error);
  }, []);

  const openDetail = async (order) => {
    try { setDetail(await monitorService.detailOrder(order._id || order)); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const totalSales = sales && (typeof sales === 'object' ? (sales.total || sales.value || 0) : Number(sales) || 0);

  const cols = [
    { key: 'orderNumber', title: 'Nº Pedido', render: (v) => <b>{v || '-'}</b> },
    { key: 'clientId', title: 'Cliente', render: (v) => (v && typeof v === 'object' ? (v.name || v._id) : v) || '-' },
    { key: 'deliverymanId', title: 'Entregador', render: (v) => (v && typeof v === 'object' ? (v.name || v._id) : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || 'Pendente'}</span> },
    { key: 'createdAt', title: 'Criado', render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      {totalSales != null && (
        <div className="stats-grid" style={{ marginBottom: '1rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}><TrendingUp size={24} /></div>
            <div className="stat-info"><h4>R$ {Number(totalSales).toFixed(2)}</h4><p>Vendas (últimas 24h)</p></div>
          </div>
        </div>
      )}
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Pedidos em tempo real</h4>
        <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
      </div>
      <DataTable data={items} columns={cols} onView={openDetail} loading={loading} emptyMessage="Nenhum pedido monitorado" />

      {detail && (
        <DetailModal detail={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
};

const DetailModal = ({ detail, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Detalhe do Pedido</h3>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
      </div>
      <table className="table">
        <tbody>
          <tr><td style={{ fontWeight: 700 }}>Número</td><td>{detail.orderNumber || detail._id || '-'}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Status</td><td>{detail.status || '-'}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Subtotal</td><td>R$ {Number(detail.subTotal || 0).toFixed(2)}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Total</td><td>R$ {Number(detail.total || detail.totalAmount || 0).toFixed(2)}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Pagamento</td><td>{detail.paymentMethod || detail.formaDePagamento || '-'}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Criado</td><td>{detail.createdAt ? new Date(detail.createdAt).toLocaleString('pt-BR') : '-'}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

const ChatTab = () => {
  const [cartId, setCartId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRead, setNoRead] = useState(null);
  const [message, setMessage] = useState('');

  const load = async (cid) => {
    if (!cid) return;
    setLoading(true);
    try {
      const res = await chatService.listByCart(cid);
      setItems(extractList(res));
      const n = await chatService.noRead(cid);
      setNoRead(typeof n === 'object' ? n : { total: n });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      await chatService.create({ cartId, message, ...({}) });
      setMessage('');
      load(cartId);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Chat por Pedido (Cart ID)</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={cartId} onChange={(e) => setCartId(e.target.value)} placeholder="Digite o Cart ID..." style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '280px' }} />
          <button className="btn btn-primary" onClick={() => load(cartId)}>Buscar</button>
        </div>
      </div>
      {noRead != null && <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Não lidas: <b>{noRead.total ?? noRead.count ?? 0}</b></p>}
      <div style={{ maxHeight: '350px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
        {loading ? <div className="loading"><div className="spinner" /></div> :
          items.length === 0 ? <p style={{ color: '#9ca3af' }}>Nenhuma mensagem. Busque um cart ID.</p> :
          items.map((m) => (
            <div key={m._id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.origin || '?'} · {new Date(m.createdAt).toLocaleString('pt-BR')}</div>
              <div>{m.message || m.description || '-'}</div>
            </div>
          ))}
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="text" className="form-control" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem..." required style={{ flex: 1, padding: '0.5rem' }} />
        <button className="btn btn-primary" type="submit">Enviar</button>
      </form>
    </div>
  );
};

const ToolsTab = () => {
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tools — Popups e Integrações</h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <PopupsPanel />
        <IntegrationsPanel />
      </div>
    </div>
  );
};

const PopupsPanel = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => toolsService.listPopups({ page: 1, limit: 50 }).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const cols = [
    { key: 'title', title: 'Título', render: (v) => <b>{v || '-'}</b> },
    { key: 'text', title: 'Texto', render: (v) => (v && String(v).length > 40 ? String(v).slice(0, 40) + '…' : v) || '-' },
    { key: 'position', title: 'Posição', render: (v) => v || '-' },
  ];
  return (
    <div className="card">
      <div className="card-header"><h4>Popups</h4></div>
      <div style={{ padding: '0.75rem' }}>
        <DataTable data={items} columns={cols} loading={loading} emptyMessage="Sem popups" />
      </div>
    </div>
  );
};

const IntegrationsPanel = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => toolsService.listIntegrations({ page: 1, limit: 50 }).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const cols = [
    { key: 'company', title: 'Empresa', render: (v) => (v && typeof v === 'object' ? (v.name || v._id) : v) || '-' },
    { key: 'integration', title: 'Integração', render: (v) => <b>{v || '-'}</b> },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativa' : 'Inativa'}</span> },
  ];
  return (
    <div className="card">
      <div className="card-header"><h4>Integrações</h4></div>
      <div style={{ padding: '0.75rem' }}>
        <DataTable data={items} columns={cols} loading={loading} emptyMessage="Sem integrações" />
      </div>
    </div>
  );
};

export default Monitor;
