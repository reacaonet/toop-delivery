import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, X } from 'lucide-react';
import { shoppingDepartmentService, companyService } from '../services/api';
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

const ShoppingDepartments = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: '',
    suggesteds: '',
    showInApp: true,
    status: true,
    company: '',
  });

  const PAGE_SIZE = 30;

  const load = async () => {
    setLoading(true);
    try {
      const res = await shoppingDepartmentService.paginator({
        pageIn: page,
        pageOut: PAGE_SIZE,
        term: term || undefined,
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
    companyService.getCompanies().then((r) => setCompanies(extractList(r))).catch(() => {});
  }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => {
    setSelected(null);
    setForm({ name: '', suggesteds: '', showInApp: true, status: true, company: '' });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      suggesteds: (it.suggesteds || []).join(', '),
      showInApp: it.showInApp !== false,
      status: it.status !== false,
      company: it.company?._id || it.company || '',
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        suggesteds: form.suggesteds
          ? form.suggesteds.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        showInApp: form.showInApp,
        status: form.status,
        company: form.company || undefined,
      };
      if (selected) {
        await shoppingDepartmentService.update(selected._id, payload);
      } else {
        await shoppingDepartmentService.create(payload);
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
    if (!window.confirm(`Excluir departamento "${it.name}"?`)) return;
    try {
      await shoppingDepartmentService.remove(it._id);
      load();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    {
      key: 'company',
      title: 'Empresa',
      render: (v) => {
        if (v && typeof v === 'object') return v.name || '-';
        return '-';
      },
    },
    {
      key: 'showInApp',
      title: 'App',
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
            <LayoutGrid size={20} style={{ marginRight: '0.5rem' }} />
            Departamentos
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); load(); } }}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
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
            emptyMessage="Nenhum departamento encontrado"
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
              <h3>{selected ? 'Editar Departamento' : 'Novo Departamento'}</h3>
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
                <label>Sugestões * (separadas por vírgula)</label>
                <input type="text" name="suggesteds" value={form.suggesteds} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Empresa (ID)</label>
                <select name="company" value={form.company} onChange={change}>
                  <option value="">Nenhuma</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
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

export default ShoppingDepartments;
