import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, X, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { groupService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const PAGE_SIZE = 20;

const Groups = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [franchiseFilter, setFranchiseFilter] = useState('');
  const [franchises, setFranchises] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', status: true, franchise: '', images: '' });

  const load = (pg = page) => {
    setLoading(true);
    const params = { pageIn: pg, pageOut: PAGE_SIZE };
    if (franchiseFilter) params.franchise = franchiseFilter;
    if (search.trim()) params.listPorNome = search.trim();
    return groupService.paginator(params)
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, []); // eslint-disable-line
  useEffect(() => {
    franchiseService.listAll()
      .then((r) => setFranchises(extractList(r)))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(0);
    setLoading(true);
    const params = { pageIn: 0, pageOut: PAGE_SIZE };
    if (franchiseFilter) params.franchise = franchiseFilter;
    if (v.trim()) params.listPorNome = v.trim();
    groupService.paginator(params)
      .then((res) => { setItems(extractList(res)); setTotal(Number(res?.total) || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleFranchiseFilter = (e) => {
    const v = e.target.value;
    setFranchiseFilter(v);
    setPage(0);
    setLoading(true);
    const params = { pageIn: 0, pageOut: PAGE_SIZE };
    if (v) params.franchise = v;
    if (search.trim()) params.listPorNome = search.trim();
    groupService.paginator(params)
      .then((res) => { setItems(extractList(res)); setTotal(Number(res?.total) || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const openNew = () => {
    setSelected(null);
    setForm({ name: '', description: '', status: true, franchise: '', images: '' });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      description: it.description || '',
      status: it.status !== false,
      franchise: it.franchise?._id || it.franchise || '',
      images: Array.isArray(it.images) ? it.images.join('\n') : '',
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const images = form.images
        ? form.images.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];
      const payload = {
        name: form.name,
        description: form.description,
        status: form.status,
        images,
      };
      if (form.franchise) payload.franchise = form.franchise;
      if (selected) {
        await groupService.update(selected._id, payload);
      } else {
        await groupService.create(payload);
      }
      await load(page);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir grupo "${it.name}"?`)) return;
    try {
      await groupService.remove(it._id);
      await load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (v) => {
    if (!v) return '-';
    return new Date(v).toLocaleDateString('pt-BR');
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'description', title: 'Descrição', render: (v) => v || '-' },
    {
      key: 'franchise',
      title: 'Franquia',
      render: (v) => (v && v.name) || (typeof v === 'string' ? v : '-'),
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => (
        <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>
          {v ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'images',
      title: 'Imagens',
      render: (v) => {
        if (!Array.isArray(v) || v.length === 0) return '0';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {v[0] && (
              <img
                src={v[0]}
                alt=""
                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <span>{v.length}</span>
          </div>
        );
      },
    },
    { key: 'createdAt', title: 'Criado em', render: (v) => formatDate(v) },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="card">
      <div className="card-header">
        <h3><LayoutGrid size={20} style={{ marginRight: '0.5rem' }} />Grupo de Empresas</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(page)}>
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={franchiseFilter}
          onChange={handleFranchiseFilter}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem', minWidth: '180px' }}
        >
          <option value="">Todas as franquias</option>
          {franchises.map((f) => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        data={items}
        columns={cols}
        onEdit={openEdit}
        onDelete={remove}
        loading={loading}
        emptyMessage="Nenhum grupo encontrado"
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button
          className="btn btn-secondary"
          disabled={page === 0 || loading}
          onClick={() => { const np = page - 1; setPage(np); load(np); }}
        >
          <ChevronLeft size={16} />Prev
        </button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button
          className="btn btn-secondary"
          disabled={page + 1 >= totalPages || loading}
          onClick={() => { const np = page + 1; setPage(np); load(np); }}
        >
          Próximo<ChevronRight size={16} />
        </button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Grupo' : 'Novo Grupo'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={form.name} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Descrição *</label>
                <textarea name="description" value={form.description} onChange={change} rows="3" required />
              </div>
              <div className="form-group">
                <label>Franquia</label>
                <select name="franchise" value={form.franchise} onChange={change}>
                  <option value="">Selecione...</option>
                  {franchises.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo
                </label>
              </div>
              <div className="form-group">
                <label>Imagens (URLs, uma por linha)</label>
                <textarea name="images" value={form.images} onChange={change} rows="3" placeholder="https://exemplo.com/img1.jpg&#10;https://exemplo.com/img2.jpg" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
