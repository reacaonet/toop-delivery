import React, { useState, useEffect } from 'react';
import { Coins, Plus, X } from 'lucide-react';
import { tipService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.response)) return res.response;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const tabs = [
  { key: 'tip', label: 'Gorjetas' },
  { key: 'tipDelivery', label: 'Gorjetas Entregador' },
];

const Tips = () => {
  const [tab, setTab] = useState('tip');
  return (
    <div className="card">
      <div className="card-header">
        <h3><Coins size={20} style={{ marginRight: '0.5rem' }} />Gorjetas</h3>
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', cursor: 'pointer',
              borderRadius: '8px', border: active ? '1px solid #10b981' : '1px solid transparent',
              background: active ? '#ecfdf5' : 'transparent', color: active ? '#047857' : '#4b5563',
              fontWeight: active ? 700 : 500, fontSize: '0.85rem',
            }}>{t.label}</button>
          );
        })}
      </div>
      <div style={{ padding: '1rem' }}>
        {tab === 'tip' && <TipTab />}
        {tab === 'tipDelivery' && <TipDeliveryTab />}
      </div>
    </div>
  );
};

const formatDate = (v) => {
  if (!v) return '-';
  try { return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return v; }
};

const TipTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ value: '', type: 'user', status: true });
  const [saving, setSaving] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ status: '', type: '' });

  const load = () => tipService.list().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const changeSearch = (e) => setSearchFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchFilters.status !== '') params.status = searchFilters.status;
      if (searchFilters.type !== '') params.type = searchFilters.type;
      const res = await tipService.search(params);
      setItems(extractList(res));
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); console.error(err); } finally { setLoading(false); }
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const val = form.value === '' || isNaN(Number(String(form.value).replace(',', '.'))) ? undefined : Number(String(form.value).replace(',', '.'));
      if (val === undefined) { alert('Informe um valor válido.'); setSaving(false); return; }
      await tipService.createTip({ value: val, type: form.type, status: form.status });
      load(); setOpen(false);
      setForm({ value: '', type: 'user', status: true });
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir gorjeta de R$ ${Number(it.value).toFixed(2)}?`)) return;
    try { await tipService.removeTip(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'value', title: 'Valor', render: (v) => <b>R$ {Number(v).toFixed(2)}</b> },
    { key: 'type', title: 'Tipo', render: (v) => v === 'system' ? 'Sistema' : 'Usuário' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'createdAt', title: 'Criado', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Gorjetas</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select name="status" value={searchFilters.status} onChange={changeSearch} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
            <option value="">Todos status</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
          <select name="type" value={searchFilters.type} onChange={changeSearch} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
            <option value="">Todos tipos</option>
            <option value="system">Sistema</option>
            <option value="user">Usuário</option>
          </select>
          <button className="btn btn-secondary" onClick={handleSearch}>Buscar</button>
          <button className="btn btn-primary" onClick={() => { setForm({ value: '', type: 'user', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onDelete={remove} loading={loading} emptyMessage="Nenhuma gorjeta" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nova Gorjeta</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Valor (R$) *</label><input type="text" name="value" value={form.value} onChange={change} placeholder="10.00" required /></div>
              <div className="form-group"><label>Tipo *</label>
                <select name="type" value={form.type} onChange={change} required>
                  <option value="user">Usuário</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
              <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TipDeliveryTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ value: '', deliveryMan: '', orderStatus: '', tip: '' });
  const [saving, setSaving] = useState(false);

  const load = () => tipService.listDeliveryMen().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const val = form.value === '' || isNaN(Number(String(form.value).replace(',', '.'))) ? undefined : Number(String(form.value).replace(',', '.'));
      if (val === undefined) { alert('Informe um valor válido.'); setSaving(false); return; }
      if (!form.deliveryMan) { alert('Informe o ID do entregador.'); setSaving(false); return; }
      if (!form.orderStatus) { alert('Informe o ID do status do pedido.'); setSaving(false); return; }
      const payload = { value: val, deliveryMan: form.deliveryMan, orderStatus: form.orderStatus };
      if (form.tip) payload.tip = form.tip;
      await tipService.createDeliveryTip(payload);
      load(); setOpen(false);
      setForm({ value: '', deliveryMan: '', orderStatus: '', tip: '' });
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir gorjeta entregador de R$ ${Number(it.value).toFixed(2)}?`)) return;
    try { await tipService.removeDeliveryTip(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const resolveRef = (v) => {
    if (!v) return '-';
    if (typeof v === 'object') return v.name || v._id || '-';
    return v;
  };

  const cols = [
    { key: 'value', title: 'Valor', render: (v) => <b>R$ {Number(v).toFixed(2)}</b> },
    { key: 'deliveryMan', title: 'Entregador', render: (v) => resolveRef(v) },
    { key: 'orderStatus', title: 'Status Pedido', render: (v) => resolveRef(v) },
    { key: 'tip', title: 'Gorjeta', render: (v) => resolveRef(v) },
    { key: 'createdAt', title: 'Criado', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Gorjetas Entregador</h4>
        <button className="btn btn-primary" onClick={() => { setForm({ value: '', deliveryMan: '', orderStatus: '', tip: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={items} columns={cols} onDelete={remove} loading={loading} emptyMessage="Nenhuma gorjeta de entregador" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nova Gorjeta Entregador</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Valor (R$) *</label><input type="text" name="value" value={form.value} onChange={change} placeholder="10.00" required /></div>
              <div className="form-group"><label>ID do Entregador *</label><input type="text" name="deliveryMan" value={form.deliveryMan} onChange={change} placeholder="ID do entregador" required /></div>
              <div className="form-group"><label>ID do Status do Pedido *</label><input type="text" name="orderStatus" value={form.orderStatus} onChange={change} placeholder="ID do status do pedido" required /></div>
              <div className="form-group"><label>ID da Gorjeta (opcional)</label><input type="text" name="tip" value={form.tip} onChange={change} placeholder="ID da gorjeta" /></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tips;
