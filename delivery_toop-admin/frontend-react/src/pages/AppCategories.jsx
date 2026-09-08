import React, { useState, useEffect } from 'react';
import { AppWindow, Plus, X } from 'lucide-react';
import { appCategoryService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const TYPE_LABEL = { supermarket: 'Supermercado', restaurant: 'Restaurante', accessories: 'Acessórios' };

const AppCategories = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'supermarket',
    keyword: '',
    segment: '',
    order: 0,
    showInApp: true,
    showHome: true,
    status: true,
    images: '',
  });

  const PAGE_SIZE = 30;

  const load = async () => {
    setLoading(true);
    try {
      const res = await appCategoryService.paginator({
        page: page + 1,
        limit: PAGE_SIZE,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(extractList(res));
      setTotal(res?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  useEffect(() => {
    if (page !== 0) setPage(0);
  }, [typeFilter, statusFilter]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => {
    setSelected(null);
    setForm({ name: '', type: 'supermarket', keyword: '', segment: '', order: 0, showInApp: true, showHome: true, status: true, images: '' });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      type: it.type || 'supermarket',
      keyword: it.keyword || '',
      segment: it.segment || '',
      order: it.order || 0,
      showInApp: it.showInApp !== false,
      showHome: it.showHome !== false,
      status: it.status !== false,
      images: (it.images || []).join(', '),
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        keyword: form.keyword || undefined,
        segment: form.segment || undefined,
        order: Number(form.order) || 0,
        showInApp: form.showInApp,
        showHome: form.showHome,
        status: form.status,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (selected) {
        await appCategoryService.update(selected._id, payload);
      } else {
        await appCategoryService.create(payload);
      }
      setOpen(false);
      load();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir categoria "${it.name}"?`)) return;
    try {
      await appCategoryService.remove(it._id);
      load();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    {
      key: 'type',
      title: 'Tipo',
      render: (v) => <span>{TYPE_LABEL[v] || v}</span>,
    },
    { key: 'segment', title: 'Segmento', render: (v) => v || '-' },
    { key: 'order', title: 'Ordem', render: (v) => v ?? 0 },
    {
      key: 'showInApp',
      title: 'No App',
      render: (v) => (
        <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>
          {v ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      key: 'showHome',
      title: 'Home',
      render: (v) => (
        <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>
          {v ? 'Sim' : 'Não'}
        </span>
      ),
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
      key: 'createdAt',
      title: 'Criado em',
      render: (v) => {
        if (!v) return '-';
        try { return new Date(v).toLocaleDateString('pt-BR'); } catch { return '-'; }
      },
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>
            <AppWindow size={20} style={{ marginRight: '0.5rem' }} />
            Categorias de App
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">Tipo (todos)</option>
              <option value="supermarket">Supermercado</option>
              <option value="restaurant">Restaurante</option>
              <option value="accessories">Acessórios</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">Status (todos)</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Novo
            </button>
          </div>
        </div>
        <div style={{ padding: '1rem' }}>
          <DataTable
            data={items}
            columns={columns}
            onEdit={openEdit}
            onDelete={remove}
            loading={loading}
            emptyMessage="Nenhuma categoria de app encontrada"
          />
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
                {page + 1} / {totalPages}
              </span>
              <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={form.name} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select name="type" value={form.type} onChange={change}>
                  <option value="supermarket">Supermercado</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="accessories">Acessórios</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Keyword</label>
                  <input type="text" name="keyword" value={form.keyword} onChange={change} />
                </div>
                <div className="form-group">
                  <label>Segmento</label>
                  <input type="text" name="segment" value={form.segment} onChange={change} />
                </div>
              </div>
              <div className="form-group">
                <label>Ordem</label>
                <input type="number" name="order" value={form.order} onChange={change} />
              </div>
              <div className="form-group">
                <label>Imagens (URLs separadas por vírgula)</label>
                <input type="text" name="images" value={form.images} onChange={change} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="showInApp" checked={form.showInApp} onChange={change} />
                    {' '}Exibir no App
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="showHome" checked={form.showHome} onChange={change} />
                    {' '}Exibir na Home
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="status" checked={form.status} onChange={change} />
                    {' '}Ativo
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
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

export default AppCategories;