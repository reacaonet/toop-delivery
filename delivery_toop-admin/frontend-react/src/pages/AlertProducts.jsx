import React, { useState, useEffect } from 'react';
import { BellRing, Plus, X, FileText, RefreshCw } from 'lucide-react';
import { alertProductService } from '../services/api';
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

const AlertProducts = () => {
  const [tab, setTab] = useState('list');
  const tabs = [
    { key: 'list', label: 'Alertas', icon: BellRing },
    { key: 'report', label: 'Relatório', icon: FileText },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><BellRing size={20} style={{ marginRight: '0.5rem' }} />Alertas de Produto</h3>
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
          {tab === 'list' && <AlertListTab />}
          {tab === 'report' && <AlertReportTab />}
        </div>
      </div>
    </div>
  );
};

const AlertListTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ company: '', customer: '', product: '' });
  const [saving, setSaving] = useState(false);

  const load = () => alertProductService.list().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (selected) {
        await alertProductService.update(selected._id);
      } else {
        await alertProductService.create({ company: form.company, customer: form.customer, product: form.product });
      }
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const formatDate = (v) => {
    if (!v) return '-';
    try { return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return v; }
  };

  const cols = [
    { key: 'customer', title: 'Cliente', render: (v) => (v && typeof v === 'object' ? (v.name || v._id) : v) || '-' },
    { key: 'product', title: 'Produto', render: (v) => (v && typeof v === 'object' ? (v.name || v._id) : v) || '-' },
    { key: 'barcode', title: 'Código de Barras', render: (v) => v || '-' },
    { key: 'priceClick', title: 'Preço Clique', render: (v) => v != null ? 'R$ ' + Number(v).toFixed(2) : '-' },
    { key: 'followingAt', title: 'Seguindo desde', render: (v) => formatDate(v) },
    { key: 'active', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Alertas</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ company: '', customer: '', product: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ company: it.company && typeof it.company === 'object' ? it.company._id || '' : it.company || '', customer: it.customer && typeof it.customer === 'object' ? it.customer._id || '' : it.customer || '', product: it.product && typeof it.product === 'object' ? it.product._id || '' : it.product || '' }); setOpen(true); }} loading={loading} emptyMessage="Nenhum alerta de produto" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Alerta' : 'Novo Alerta'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              {selected ? (
                <div>
                  <div className="form-group"><label>Cliente</label><input type="text" value={selected.customer && typeof selected.customer === 'object' ? selected.customer.name || selected.customer._id : selected.customer || ''} disabled /></div>
                  <div className="form-group"><label>Produto</label><input type="text" value={selected.product && typeof selected.product === 'object' ? selected.product.name || selected.product._id : selected.product || ''} disabled /></div>
                  <div className="form-group"><label>Código de Barras</label><input type="text" value={selected.barcode || ''} disabled /></div>
                  <div className="form-group"><label>Preço Clique</label><input type="text" value={selected.priceClick != null ? 'R$ ' + Number(selected.priceClick).toFixed(2) : ''} disabled /></div>
                  <div className="form-group"><label>Seguindo desde</label><input type="text" value={formatDate(selected.followingAt)} disabled /></div>
                  <div className="form-group"><label>Status</label><input type="text" value={selected.active ? 'Ativo' : 'Inativo'} disabled /></div>
                </div>
              ) : (
                <div>
                  <div className="form-group"><label>Empresa *</label><input type="text" name="company" value={form.company} onChange={change} placeholder="ID da empresa" required /></div>
                  <div className="form-group"><label>Cliente *</label><input type="text" name="customer" value={form.customer} onChange={change} placeholder="ID do cliente" required /></div>
                  <div className="form-group"><label>Produto *</label><input type="text" name="product" value={form.product} onChange={change} placeholder="ID do produto" required /></div>
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : selected ? 'Desativar' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AlertReportTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await alertProductService.report({ page: p, limit: 50 });
      const list = extractList(res?.response !== undefined ? res.response : res);
      setItems(list);
      if (res?.total?.documents != null) setTotal(res.total.documents);
      else if (res?.pagination) setTotal(res.total?.documents || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(page); }, [page]);

  const cols = [
    { key: '_id', title: 'Código de Barras', render: (v) => <b>{v}</b> },
    { key: 'product', title: 'Produto', render: (v) => (v && v.name) || '-' },
    { key: 'qtd', title: 'Quantidade de Alertas', render: (v) => v ?? 0 },
    { key: 'product', title: 'Preço', render: (_, it) => it.product?.price != null ? 'R$ ' + Number(it.product.price).toFixed(2) : '-' },
    { key: 'product', title: 'Preço Promo', render: (_, it) => it.product?.promoPrice != null && it.product.promoPrice > 0 ? 'R$ ' + Number(it.product.promoPrice).toFixed(2) : '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Relatório de Alertas</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total: {total}</span>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} /> Atualizar</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum dado de relatório" />
      {total > 50 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
          <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Página {page}</span>
          <button className="btn btn-secondary" disabled={items.length < 50} onClick={() => setPage((p) => p + 1)}>Próxima</button>
        </div>
      )}
    </div>
  );
};

export default AlertProducts;
