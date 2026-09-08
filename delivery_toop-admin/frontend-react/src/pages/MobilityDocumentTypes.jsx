import React, { useState, useEffect } from 'react';
import { FileText, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityDocumentTypeService } from '../services/api';
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

const MobilityDocumentTypes = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'DRIVER', status: true });

  const load = (pg = page) => {
    setLoading(true);
    const params = { pageIn: pg, pageOut: PAGE_SIZE };
    if (search.trim()) params.name = search.trim();
    return mobilityDocumentTypeService.paginator(params)
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); setPage(0); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((p) => ({ ...p, [name]: inputType === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, type: form.type, status: form.status };
      if (selected) {
        await mobilityDocumentTypeService.update(selected._id, payload);
      } else {
        await mobilityDocumentTypeService.create(payload);
      }
      await load(page);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      await mobilityDocumentTypeService.update(item._id, { status: !item.status });
      await load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir tipo de documento "${it.name}"?`)) return;
    try {
      await mobilityDocumentTypeService.remove(it._id);
      await load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const openNew = () => {
    setSelected(null);
    setForm({ name: '', type: 'DRIVER', status: true });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      type: it.type || 'DRIVER',
      status: it.status !== false,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    {
      key: 'type',
      title: 'Tipo',
      render: (v) => (
        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: v === 'VEHICLE' ? '#eff6ff' : '#f0fdf4', color: v === 'VEHICLE' ? '#1d4ed8' : '#15803d' }}>
          {v === 'VEHICLE' ? 'Veículo' : 'Motorista'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (v, item) => (
        <span
          onClick={() => toggleStatus(item)}
          style={{ cursor: 'pointer', fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}
          title={v ? 'Clique para desativar' : 'Clique para ativar'}
        >
          {v ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><FileText size={20} style={{ marginRight: '0.5rem' }} />Tipos de Documento</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', width: '180px' }}
          />
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum tipo de documento encontrado" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Tipo de Documento' : 'Novo Tipo de Documento'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={form.name} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select name="type" value={form.type} onChange={change} required>
                  <option value="DRIVER">Motorista</option>
                  <option value="VEHICLE">Veículo</option>
                </select>
              </div>
              <div className="form-group">
                <label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label>
              </div>
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

export default MobilityDocumentTypes;
