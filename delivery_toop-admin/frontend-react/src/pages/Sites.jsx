import React, { useState, useEffect } from 'react';
import { Globe2, Plus, X } from 'lucide-react';
import { siteService, companyService } from '../services/api';
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

const Sites = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: '',
    company: '',
    domain: '',
    URLlogo: '',
    email: '',
    about: '',
    slider: '',
    status: true,
  });

  const PAGE_SIZE = 30;

  const load = async () => {
    setLoading(true);
    try {
      const res = await siteService.paginator({ page, limit: PAGE_SIZE });
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
    setForm({ name: '', company: '', domain: '', URLlogo: '', email: '', about: '', slider: '', status: true });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      company: it.company?._id || it.company || '',
      domain: it.domain || '',
      URLlogo: it.URLlogo || '',
      email: it.email || '',
      about: it.about || '',
      slider: it.slider || '',
      status: it.status !== false,
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        company: form.company || undefined,
        domain: form.domain,
        URLlogo: form.URLlogo,
        email: form.email,
        about: form.about,
        slider: form.slider,
        status: form.status,
      };
      if (selected) {
        await siteService.update(selected._id, payload);
      } else {
        await siteService.create(payload);
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
    if (!window.confirm(`Excluir site "${it.name}"?`)) return;
    try {
      await siteService.remove(it._id);
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
    { key: 'domain', title: 'Domínio', render: (v) => v || '-' },
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
            <Globe2 size={20} style={{ marginRight: '0.5rem' }} />
            Sites de Empresa
          </h3>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Novo
          </button>
        </div>
        <div style={{ padding: '1rem' }}>
          <DataTable
            data={items}
            columns={columns}
            onEdit={openEdit}
            onDelete={remove}
            loading={loading}
            emptyMessage="Nenhum site encontrado"
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
              <h3>{selected ? 'Editar Site' : 'Novo Site'}</h3>
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
                <label>Empresa *</label>
                <select name="company" value={form.company} onChange={change} required>
                  <option value="">Selecione...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Domínio</label>
                <input type="text" name="domain" value={form.domain} onChange={change} placeholder="exemplo.com.br" />
              </div>
              <div className="form-group">
                <label>URL Logo</label>
                <input type="text" name="URLlogo" value={form.URLlogo} onChange={change} placeholder="https://" />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" name="email" value={form.email} onChange={change} />
              </div>
              <div className="form-group">
                <label>Sobre</label>
                <textarea name="about" value={form.about} onChange={change} rows={3} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Slider</label>
                <input type="text" name="slider" value={form.slider} onChange={change} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="status" checked={form.status} onChange={change} />
                  {' '}Ativo
                </label>
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

export default Sites;
