import React, { useState, useEffect } from 'react';
import { Headphones, Plus, X, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilitySupportSubjectService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const PAGE_SIZE = 10;

const mobilitySupportSubjects = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ franchise: '', subject: '', type: 'PASSENGER', target: 'CANCEL', status: true });
  const [franchises, setFranchises] = useState([]);

  const load = (pg = page, term = search) => {
    setLoading(true);
    const params = { pageIn: pg, pageOut: PAGE_SIZE, status: 'all' };
    if (term && term.trim()) params.subject = term.trim();
    return mobilitySupportSubjectService.paginator(params)
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

  const submitSearch = () => { setPage(0); load(0, search); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.franchise) { alert('Informe a franquia'); setSaving(false); return; }
      if (!form.subject.trim()) { alert('Informe o assunto'); setSaving(false); return; }
      const base = {
        franchise: form.franchise,
        subject: form.subject,
        type: form.type,
        target: form.target,
        status: form.status,
      };
      if (selected) {
        await mobilitySupportSubjectService.update(selected._id, base);
      } else {
        await mobilitySupportSubjectService.create(base);
      }
      await load(page, search);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir support subject "${it.subject}"?`)) return;
    try { await mobilitySupportSubjectService.remove(it._id); await load(page, search); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const toggleStatus = async (it) => {
    try {
      await mobilitySupportSubjectService.update(it._id, { status: !it.status });
      await load(page, search);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const openNew = () => {
    setSelected(null);
    setForm({ franchise: '', subject: '', type: 'PASSENGER', target: 'CANCEL', status: true });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      franchise: it.franchise?._id || it.franchise || '',
      subject: it.subject || '',
      type: it.type || 'PASSENGER',
      target: it.target || 'CANCEL',
      status: it.status !== false,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    { key: 'subject', title: 'Assunto', render: (v) => <b>{v}</b> },
    { key: 'franchise', title: 'Franquia', render: (v) => (v && v.name) || '-' },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    { key: 'target', title: 'Destino', render: (v) => v || '-' },
    { key: 'createdAt', title: 'Criado em', render: (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '-') },
    {
      key: 'status',
      title: 'Status',
      render: (v, it) => (
        <button
          className="btn btn-secondary"
          onClick={() => toggleStatus(it)}
          style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280', padding: '0.35rem 0.75rem' }}
        >
          {v ? 'Ativo' : 'Inativo'}
        </button>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><Headphones size={20} style={{ marginRight: '0.5rem' }} />Support Subjects</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="Buscar por assunto"
              style={{ padding: '0.45rem 0.6rem 0.45rem 2rem' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={submitSearch} style={{ padding: '0.4rem 0.6rem' }}><Search size={14} /></button>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum support subject" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Support Subject' : 'Novo Support Subject'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Franquia *</label><select name="franchise" value={form.franchise} onChange={change} required><option value="">Selecione...</option>{franchises.map((f) => (<option key={f._id} value={f._id}>{f.name}</option>))}</select></div>
              <div className="form-group"><label>Assunto *</label><input type="text" name="subject" value={form.subject} onChange={change} required /></div>
              <div className="form-group"><label>Tipo *</label><select name="type" value={form.type} onChange={change} required><option value="PASSENGER">PASSENGER</option><option value="DRIVER">DRIVER</option></select></div>
              <div className="form-group"><label>Destino *</label><select name="target" value={form.target} onChange={change} required><option value="CANCEL">CANCEL</option><option value="SUPPORT">SUPPORT</option></select></div>
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

export default mobilitySupportSubjects;