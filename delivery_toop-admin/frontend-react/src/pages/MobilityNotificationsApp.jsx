import React, { useState, useEffect, useCallback } from 'react';
import { Bell, ImagePlus, PieChart, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityNotificationAppService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ALL', label: 'Todos (ALL)' },
  { value: 'DRIVER', label: 'Motorista (DRIVER)' },
  { value: 'PASSENGER', label: 'Passageiro (PASSENGER)' },
];

const PAGE_SIZE = 20;

const MobilityNotificationsApp = () => {
  const [tab, setTab] = useState('notifications');

  const tabs = [
    { key: 'notifications', label: 'Notificações', icon: Bell },
    { key: 'new', label: 'Nova', icon: Plus },
    { key: 'graphic', label: 'Gráfico', icon: PieChart },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Bell size={20} style={{ marginRight: '0.5rem' }} />Notificações In-App</h3>
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
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'new' && <NewTab onCreated={() => setTab('notifications')} />}
          {tab === 'graphic' && <GraphicTab />}
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterFranchise, setFilterFranchise] = useState('');
  const [franchises, setFranchises] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', type: 'ALL', status: true, franchise: '', expirationDate: '', url: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback((pg = page) => {
    setLoading(true);
    const params = { pageIn: pg, pageOut: PAGE_SIZE };
    if (filterType) params.type = filterType;
    if (filterFranchise) params.franchise = filterFranchise;
    return mobilityNotificationAppService.paginator(params)
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filterType, filterFranchise]);

  useEffect(() => { load(0); setPage(0); }, [filterType, filterFranchise]);
  useEffect(() => { load(0); }, []);
  useEffect(() => {
    franchiseService.listAll().then((r) => setFranchises(extractList(r))).catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleStatus = async (item) => {
    try {
      await mobilityNotificationAppService.update(item._id, { status: !item.status });
      load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Excluir notificação?')) return;
    try {
      await mobilityNotificationAppService.remove(item._id);
      load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      description: item.description || '',
      type: item.type || 'ALL',
      status: item.status !== false,
      franchise: item.franchise?._id || item.franchise || '',
      expirationDate: item.expirationDate ? (item.expirationDate + '').slice(0, 10) : '',
      url: (item.images && item.images[0]) || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        description: editForm.description,
        type: editForm.type,
        status: editForm.status,
        expirationDate: editForm.expirationDate || undefined,
      };
      if (editForm.franchise) payload.franchise = editForm.franchise;
      if (editForm.url) payload.url = editForm.url;
      await mobilityNotificationAppService.update(editItem._id, payload);
      setEditItem(null);
      load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const cols = [
    { key: 'description', title: 'Descrição', render: (v) => <b>{v}</b> },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    {
      key: 'images',
      title: 'Imagem',
      render: (v) => {
        const img = Array.isArray(v) && v[0] ? v[0] : null;
        return img ? <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ color: '#9ca3af' }}>-</span>;
      },
    },
    { key: 'franchise', title: 'Franquia', render: (v) => (v && v.name) || '-' },
    {
      key: 'status',
      title: 'Status',
      render: (v, row) => (
        <button onClick={() => toggleStatus(row)} style={{
          fontWeight: 700, color: v ? '#10b981' : '#6b7280', background: 'none',
          border: '1px solid ' + (v ? '#10b981' : '#d1d5db'), borderRadius: '6px',
          padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem',
        }}>
          {v ? 'Ativo' : 'Inativo'}
        </button>
      ),
    },
    {
      key: 'expirationDate',
      title: 'Validade',
      render: (v) => v ? (v + '').slice(0, 10) : '-',
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Notificações In-App</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={filterFranchise} onChange={(e) => setFilterFranchise(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
            <option value="">Todas franquias</option>
            {franchises.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhuma notificação encontrada" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Editar Notificação</h3><button className="close-btn" onClick={() => setEditItem(null)}><X size={24} /></button></div>
            <form onSubmit={saveEdit}>
              <div className="form-group"><label>Descrição *</label><input type="text" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} required /></div>
              <div className="form-group"><label>Tipo *</label><select value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))} required><option value="ALL">Todos</option><option value="DRIVER">Motorista</option><option value="PASSENGER">Passageiro</option></select></div>
              <div className="form-group"><label>Franquia</label><select value={editForm.franchise} onChange={(e) => setEditForm((p) => ({ ...p, franchise: e.target.value }))}><option value="">Selecione...</option>{franchises.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
              <div className="form-group"><label>Data de Validade</label><input type="date" value={editForm.expirationDate} onChange={(e) => setEditForm((p) => ({ ...p, expirationDate: e.target.value }))} /></div>
              <div className="form-group"><label>URL da Imagem</label><input type="text" value={editForm.url} onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
              {editForm.url && <div style={{ marginBottom: '0.75rem' }}><img src={editForm.url} alt="preview" style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} /></div>}
              <div className="form-group"><label><input type="checkbox" checked={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.checked }))} /> Ativo</label></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTab = ({ onCreated }) => {
  const [form, setForm] = useState({ description: '', type: 'ALL', franchise: '', expirationDate: '', url: '' });
  const [franchises, setFranchises] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    franchiseService.listAll().then((r) => setFranchises(extractList(r))).catch(() => {});
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        description: form.description,
        type: form.type,
        expirationDate: form.expirationDate || undefined,
      };
      if (form.franchise) payload.franchise = form.franchise;
      if (form.url) {
        payload.file = [{ url: form.url }];
      }
      await mobilityNotificationAppService.create(payload);
      alert('Notificação criada com sucesso!');
      setForm({ description: '', type: 'ALL', franchise: '', expirationDate: '', url: '' });
      if (onCreated) onCreated();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Nova Notificação In-App</h4>
      </div>
      <form onSubmit={save} style={{ maxWidth: '600px' }}>
        <div className="form-group"><label>Descrição *</label><textarea name="description" value={form.description} onChange={change} required rows={3} placeholder="Texto da notificação que será exibida no app..." /></div>
        <div className="form-group"><label>Tipo *</label><select name="type" value={form.type} onChange={change} required><option value="ALL">Todos</option><option value="DRIVER">Motorista</option><option value="PASSENGER">Passageiro</option></select></div>
        <div className="form-group"><label>Franquia</label><select name="franchise" value={form.franchise} onChange={change}><option value="">Selecione (opcional)...</option>{franchises.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
        <div className="form-group"><label>Data de Validade *</label><input type="date" name="expirationDate" value={form.expirationDate} onChange={change} required /></div>
        <div className="form-group"><label>URL da Imagem</label><input type="text" name="url" value={form.url} onChange={change} placeholder="https://..." /></div>
        {form.url && <div style={{ marginBottom: '0.75rem' }}><img src={form.url} alt="preview" style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} /></div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Criar Notificação'}</button>
        </div>
      </form>
    </div>
  );
};

const GraphicTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    mobilityNotificationAppService.graphic()
      .then((res) => setData(extractList(res)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Gráfico de Notificações</h4>
        <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
      </div>
      {data.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Nenhum dado encontrado.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {data.map((d, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem',
              background: '#f9fafb',
            }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                {String(d._id.day).padStart(2, '0')}/{String(d._id.month).padStart(2, '0')}/{d._id.year}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{d.enable}</span>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Ativos</div>
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{d.disabled}</span>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Inativos</div>
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{d.total}</span>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Total</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobilityNotificationsApp;
