// /mobility/peak-hours
import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityService, franchiseService } from '../services/api';
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

const MobilityPeakHours = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ franchise: '', start: '', end: '', status: true });
  const [franchises, setFranchises] = useState([]);

  const load = (pg = page) => {
    setLoading(true);
    return mobilityService.listPeakHours({ pageIn: pg, pageOut: PAGE_SIZE, status: 'all' })
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

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        franchise: form.franchise,
        start: form.start,
        end: form.end,
        status: form.status,
      };
      if (selected) {
        await mobilityService.updatePeakHour(selected._id, payload);
      } else {
        await mobilityService.createPeakHour(payload);
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
      await mobilityService.updatePeakHour(item._id, { status: !item.status });
      await load(page);
    } catch (err) {
      alert('Erro ao alterar status: ' + (err.response?.data?.error || err.message));
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir horário de pico "${it.start} - ${it.end}"?`)) return;
    try {
      await mobilityService.deletePeakHour(it._id);
      await load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const openNew = () => {
    setSelected(null);
    setForm({ franchise: '', start: '', end: '', status: true });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      franchise: it.franchise?._id || it.franchise || '',
      start: it.start || '',
      end: it.end || '',
      status: it.status !== false,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    {
      key: 'franchise',
      title: 'Franquia',
      render: (v) => (v && v.name) || '-',
    },
    {
      key: 'start',
      title: 'Início',
      render: (v) => <b>{v || '-'}</b>,
    },
    {
      key: 'end',
      title: 'Fim',
      render: (v) => <b>{v || '-'}</b>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (v, item) => (
        <span
          onClick={() => toggleStatus(item)}
          style={{
            fontWeight: 700,
            color: v ? '#10b981' : '#6b7280',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Clique para alternar"
        >
          {v ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><Clock size={20} style={{ marginRight: '0.5rem' }} />Horários de Pico</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum horário de pico encontrado" />
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
              <h3>{selected ? 'Editar Horário de Pico' : 'Novo Horário de Pico'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Franquia *</label>
                <select name="franchise" value={form.franchise} onChange={change} required>
                  <option value="">Selecione...</option>
                  {franchises.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Início (ex: 800 = 08h00) *</label>
                <input type="text" name="start" value={form.start} onChange={change} placeholder="800" required />
              </div>
              <div className="form-group">
                <label>Fim (ex: 1800 = 18h00) *</label>
                <input type="text" name="end" value={form.end} onChange={change} placeholder="1800" required />
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

export default MobilityPeakHours;
