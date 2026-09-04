import React, { useState, useEffect } from 'react';
import { UserPlus, Truck, Check, X, RefreshCw } from 'lucide-react';
import { preRegisterService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.records)) return res.records;
  return [];
};

const PreRegister = () => {
  const [tab, setTab] = useState('pre');
  const tabs = [
    { key: 'pre', label: 'Pré-registro', icon: UserPlus },
    { key: 'deliveryman', label: 'Cadastro Entregador', icon: Truck },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><UserPlus size={20} style={{ marginRight: '0.5rem' }} />Pré-registro / Aprovação</h3>
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
          {tab === 'pre' && <PreTab />}
          {tab === 'deliveryman' && <DeliverymanTab />}
        </div>
      </div>
    </div>
  );
};

const statusBadge = { APPROVED: '#10b981', DECLINED: '#ef4444', RESENT: '#f59e0b', PENDENTE: '#3b82f6', PENDING: '#3b82f6' };

const PreTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageIn, setPageIn] = useState(1);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await preRegisterService.paginator({ pageIn: pageIn, pageOut: 50, status: filter, name: search || undefined, email: search || undefined, phone: search || undefined, cpf: search || undefined });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter, pageIn]);

  const apply = async (it, status) => {
    if (!window.confirm(`Alterar status de "${it.name || it.phone || it._id}" para ${status}?`)) return;
    try { await preRegisterService.update(it._id, { status }); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v, it) => v || it.name || '-' },
    { key: 'phone', title: 'Telefone', render: (v) => v || '-' },
    { key: 'email', title: 'E-mail', render: (v) => v || '-' },
    { key: 'cpf', title: 'CPF', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: statusBadge[v] || '#6b7280' }}>{v}</span> },
    { key: '_id', title: 'Ações', render: (_, it) => (
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {it.status !== 'APPROVED' && <button className="btn btn-success btn-sm" onClick={() => apply(it, 'APPROVED')}><Check size={14} /> Aprovar</button>}
        {it.status !== 'DECLINED' && it.status !== 'RESENT' && <button className="btn btn-danger btn-sm" onClick={() => apply(it, 'DECLINED')}><X size={14} /> Recusar</button>}
        {it.status === 'DECLINED' && <button className="btn btn-secondary btn-sm" onClick={() => apply(it, 'RESENT')}><RefreshCw size={14} /> Reenviar</button>}
      </div>
    ) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Pré-registro (consumidor)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPageIn(1); }} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            {['ALL', 'PENDENTE', 'APPROVED', 'DECLINED', 'RESENT'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" placeholder="Buscar nome/e-mail/telefone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '240px' }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPageIn(1); load(); } }} />
          <button className="btn btn-secondary" onClick={() => { setPageIn(1); load(); }}>Buscar</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum pré-registro" />
    </div>
  );
};

const DeliverymanTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await preRegisterService.registerPaginator({ page, limit: 50 });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page]);

  const apply = async (it, status) => {
    if (!window.confirm(`Alterar status de "${it.name || it._id}" para ${status}?`)) return;
    try { await preRegisterService.updateRegisterStatus(it._id, { status }); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v, it) => v || it.name || it.userName || '-' },
    { key: 'phone', title: 'Telefone', render: (v, it) => v || it.phone || '-' },
    { key: 'email', title: 'E-mail', render: (v, it) => v || it.email || '-' },
    { key: 'cpf', title: 'CPF', render: (v, it) => v || it.cpf || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: statusBadge[v] || '#6b7280' }}>{v}</span> },
    { key: '_id', title: 'Ações', render: (_, it) => (
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {it.status !== 'APPROVED' && <button className="btn btn-success btn-sm" onClick={() => apply(it, 'APPROVED')}><Check size={14} /> Aprovar</button>}
        {it.status !== 'DECLINED' && it.status !== 'RESENT' && <button className="btn btn-danger btn-sm" onClick={() => apply(it, 'DECLINED')}><X size={14} /> Recusar</button>}
      </div>
    ) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Cadastro de Entregador</h4>
        <button className="btn btn-secondary" onClick={() => load()}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum cadastro de entregador" />
    </div>
  );
};

export default PreRegister;
