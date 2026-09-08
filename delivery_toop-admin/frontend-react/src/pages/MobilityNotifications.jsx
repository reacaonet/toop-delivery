// /mobility/notifications
import React, { useState, useEffect } from 'react';
import { Bell, Percent, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityNotificationService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const PAGE_SIZE = 10;

const MobilityNotifications = () => {
  const [tab, setTab] = useState('push');

  const tabs = [
    { key: 'push', label: 'Push Notifications', icon: Bell },
    { key: 'discount', label: 'Cupom Desconto', icon: Percent },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Bell size={20} style={{ marginRight: '0.5rem' }} />Mobility Push / Fatos</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
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
          {tab === 'push' && <PushTab />}
          {tab === 'discount' && <DiscountTab />}
        </div>
      </div>
    </div>
  );
};

const PushTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ franchise: '', topic: '', title: '', message: '' });
  const [franchises, setFranchises] = useState([]);

  const load = (pg = page) => {
    setLoading(true);
    return mobilityNotificationService.pushPaginator({ pageIn: pg, pageOut: PAGE_SIZE })
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    franchiseService.listAll().then((r) => setFranchises(extractList(r))).catch(() => {});
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.topic && !form.title && !form.message) { alert('Preencha os campos obrigatórios'); setSaving(false); return; }
      const payload = {
        franchise: form.franchise,
        topic: form.topic || null,
        title: form.title,
        message: form.message,
      };
      await mobilityNotificationService.createPush(payload);
      await load(page);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setSelected(null);
    setForm({ franchise: '', topic: '', title: '', message: '' });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    { key: 'title', title: 'Título', render: (v) => <b>{v}</b> },
    { key: 'message', title: 'Mensagem', render: (v) => v || '-' },
    { key: 'franchise', title: 'Franquia', render: (v) => (v && v.name) || '-' },
    { key: 'topic', title: 'Tópico', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v === 'success' ? '#10b981' : v === 'error' ? '#ef4444' : '#6b7280' }}>{v || '-'}</span> },
    { key: 'errMessage', title: 'Erro', render: (v) => v || '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Push Notifications</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum push notification" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nova Push Notification</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Franquia *</label><select name="franchise" value={form.franchise} onChange={change} required><option value="">Selecione...</option>{franchises.map((f) => (<option key={f._id} value={f._id}>{f.name}</option>))}</select></div>
              <div className="form-group"><label>Tópico *</label><input type="text" name="topic" value={form.topic} onChange={change} required /></div>
              <div className="form-group"><label>Título *</label><input type="text" name="title" value={form.title} onChange={change} required /></div>
              <div className="form-group"><label>Mensagem *</label><textarea name="message" value={form.message} onChange={change} required rows={3} /></div>
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

const DiscountTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', franchise: '', service: '', price: '', percent: '',
    startDate: '', endDate: '', type: 'single', amountAvailable: '', active: true,
  });
  const [franchises, setFranchises] = useState([]);

  const load = (pg = page) => {
    setLoading(true);
    return mobilityNotificationService.discountPaginator({ pageIn: pg, pageOut: PAGE_SIZE })
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    franchiseService.listAll().then((r) => setFranchises(extractList(r))).catch(() => {});
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        franchise: form.franchise,
        service: form.service || undefined,
        price: form.price ? Number(form.price) : undefined,
        percent: form.percent ? Number(form.percent) : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        amountAvailable: form.amountAvailable ? Number(form.amountAvailable) : undefined,
        active: form.active,
      };
      if (selected) {
        await mobilityNotificationService.updateDiscount(selected._id, payload);
      } else {
        await mobilityNotificationService.createDiscount(payload);
      }
      await load(page);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setSelected(null);
    setForm({
      name: '', franchise: '', service: '', price: '', percent: '',
      startDate: '', endDate: '', type: 'single', amountAvailable: '', active: true,
    });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      franchise: it.franchise?._id || it.franchise || '',
      service: it.service?._id || it.service || '',
      price: it.price ?? '',
      percent: it.percent ?? '',
      startDate: it.startDate ? (it.startDate + '').slice(0, 10) : '',
      endDate: it.endDate ? (it.endDate + '').slice(0, 10) : '',
      type: it.type || 'single',
      amountAvailable: it.amountAvailable ?? '',
      active: it.active !== false,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'franchise', title: 'Franquia', render: (v) => (v && v.name) || '-' },
    { key: 'service', title: 'Serviço', render: (v) => (v && v.name) || '-' },
    { key: 'price', title: 'Preço', render: (v) => v ?? '-' },
    { key: 'percent', title: '%', render: (v) => v ?? '-' },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    { key: 'startDate', title: 'Início', render: (v) => v ? (v + '').slice(0, 10) : '-' },
    { key: 'endDate', title: 'Fim', render: (v) => v ? (v + '').slice(0, 10) : '-' },
    { key: 'active', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Cupom Desconto</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} loading={loading} emptyMessage="Nenhum cupom desconto" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563', fontStyle: 'italic' }}>Exclusão não disponível para cupom de desconto.</span>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Cupom Desconto' : 'Novo Cupom Desconto'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label>Franquia *</label><select name="franchise" value={form.franchise} onChange={change} required><option value="">Selecione...</option>{franchises.map((f) => (<option key={f._id} value={f._id}>{f.name}</option>))}</select></div>
              <div className="form-group"><label>Serviço</label><input type="text" name="service" value={form.service} onChange={change} /></div>
              <div className="form-group"><label>Preço</label><input type="number" name="price" value={form.price} onChange={change} step="any" /></div>
              <div className="form-group"><label>Percentual (%)</label><input type="number" name="percent" value={form.percent} onChange={change} min="1" max="100" /></div>
              <div className="form-group"><label>Data Início *</label><input type="date" name="startDate" value={form.startDate} onChange={change} required /></div>
              <div className="form-group"><label>Data Fim *</label><input type="date" name="endDate" value={form.endDate} onChange={change} required /></div>
              <div className="form-group"><label>Tipo *</label><select name="type" value={form.type} onChange={change} required><option value="single">Single</option><option value="monthly">Monthly</option><option value="period">Period</option></select></div>
              <div className="form-group"><label>Qtde Disponível</label><input type="number" name="amountAvailable" value={form.amountAvailable} onChange={change} min="1" /></div>
              <div className="form-group"><label><input type="checkbox" name="active" checked={form.active} onChange={change} /> Ativo</label></div>
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

export default MobilityNotifications;
