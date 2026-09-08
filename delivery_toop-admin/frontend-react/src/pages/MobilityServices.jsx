// /mobility/services
import React, { useState, useEffect } from 'react';
import { Car, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceService } from '../services/api';
import DataTable from '../components/DataTable';

const fmt = (v) => {
  const n = Number(v);
  if (!n && n !== 0) return '-';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const CrudModal = ({ title, children, saving, onClose, onSave }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
      </div>
      <form onSubmit={onSave}>{children}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
        </div>
      </form>
    </div>
  </div>
);

const TYPE_OPTIONS = [
  { value: 'car', label: 'Carro' },
  { value: 'motorcycle', label: 'Motocicleta' },
  { value: 'bike', label: 'Bicicleta' },
  { value: 'microbus', label: 'Micro-ônibus' },
  { value: 'bus', label: 'Ônibus' },
  { value: 'truck', label: 'Caminhão' },
  { value: 'package', label: 'Pacote' },
];

const INITIAL_FORM = {
  name: '',
  type: 'car',
  capacity: 4,
  franchise: '',
  basePrice: '',
  minimumRate: '',
  fixedValue: '',
  hourlyPrice: '',
  radiusSendRace: 8,
  baseDistance: '',
  timePrice: '',
  currencyPrice: '',
  dispensingMinutes: '',
  ratePerMinute: '',
  valueByPercentage: '',
  info: '',
  status: true,
  onlyForWomen: false,
  requireConfirmationCode: false,
  showArrivalTime: true,
  useDynamicsRace: false,
};

const MobilityServices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceService.paginator({
        pageIn: page,
        pageOut: limit,
        name: search || undefined,
      });
      const list = Array.isArray(res) ? res : res?.list || [];
      setItems(list);
      setTotal(Array.isArray(res) ? list.length : (res?.total ?? 0));
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const change = (e) => setForm((p) => ({
    ...p,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const openNew = () => {
    setSelected(null);
    setForm(INITIAL_FORM);
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      name: it.name || '',
      type: it.type || 'car',
      capacity: it.capacity ?? '',
      franchise: it.franchise?._id || it.franchise || '',
      basePrice: it.basePrice ?? '',
      minimumRate: it.minimumRate ?? '',
      fixedValue: it.fixedValue ?? '',
      hourlyPrice: it.hourlyPrice ?? '',
      radiusSendRace: it.radiusSendRace ?? 8,
      baseDistance: it.baseDistance ?? '',
      timePrice: it.timePrice ?? '',
      currencyPrice: it.currencyPrice ?? '',
      dispensingMinutes: it.dispensingMinutes ?? '',
      ratePerMinute: it.ratePerMinute ?? '',
      valueByPercentage: it.valueByPercentage ?? '',
      info: it.info || '',
      status: it.status !== false,
      onlyForWomen: !!it.onlyForWomen,
      requireConfirmationCode: !!it.requireConfirmationCode,
      showArrivalTime: it.showArrivalTime !== false,
      useDynamicsRace: !!it.useDynamicsRace,
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
        capacity: Number(form.capacity) || 0,
        franchise: form.franchise || undefined,
        basePrice: form.basePrice !== '' ? Number(form.basePrice) : undefined,
        minimumRate: form.minimumRate !== '' ? Number(form.minimumRate) : undefined,
        fixedValue: form.fixedValue !== '' ? Number(form.fixedValue) : undefined,
        hourlyPrice: form.hourlyPrice !== '' ? Number(form.hourlyPrice) : undefined,
        radiusSendRace: Number(form.radiusSendRace) || 8,
        baseDistance: form.baseDistance !== '' ? Number(form.baseDistance) : undefined,
        timePrice: form.timePrice !== '' ? Number(form.timePrice) : undefined,
        currencyPrice: form.currencyPrice !== '' ? Number(form.currencyPrice) : undefined,
        dispensingMinutes: form.dispensingMinutes !== '' ? Number(form.dispensingMinutes) : undefined,
        ratePerMinute: form.ratePerMinute !== '' ? Number(form.ratePerMinute) : undefined,
        valueByPercentage: form.valueByPercentage !== '' ? Number(form.valueByPercentage) : undefined,
        info: form.info || undefined,
        status: form.status,
        onlyForWomen: form.onlyForWomen,
        requireConfirmationCode: form.requireConfirmationCode,
        showArrivalTime: form.showArrivalTime,
        useDynamicsRace: form.useDynamicsRace,
      };
      if (selected) {
        await serviceService.update(selected._id, payload);
      } else {
        await serviceService.create(payload);
      }
      load();
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir serviço "${it.name || it._id}"?`)) return;
    try {
      await serviceService.remove(it._id);
      load();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'type', title: 'Tipo', render: (v) => TYPE_OPTIONS.find((t) => t.value === v)?.label || v },
    { key: 'capacity', title: 'Capacidade', render: (v) => v ?? '-' },
    { key: 'basePrice', title: 'Preço Base', render: fmt },
    { key: 'minimumRate', title: 'Tarifa Mínima', render: fmt },
    { key: 'fixedValue', title: 'Valor Fixo', render: fmt },
    { key: 'status', title: 'Status', render: (v) => (
      <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Mobility Serviços</h3>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo
          </button>
        </div>
        <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '220px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); load(); } }}
            />
            <button className="btn btn-secondary" onClick={() => { setPage(0); load(); }}>Buscar</button>
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem' }}>
              Página {page + 1} de {totalPages} · {total} serviço(s)
            </span>
            <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} /></button>
          </div>
        </div>
        <div style={{ padding: '0 1rem 1rem' }}>
          <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum serviço encontrado" />
        </div>
      </div>

      {open && (
        <CrudModal title={selected ? 'Editar Serviço' : 'Novo Serviço'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" name="name" value={form.name} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select name="type" value={form.type} onChange={change} required>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Capacidade *</label>
              <input type="number" name="capacity" value={form.capacity} onChange={change} min="0" required />
            </div>
            <div className="form-group">
              <label>Franquia (ID)</label>
              <input type="text" name="franchise" value={form.franchise} onChange={change} placeholder="ObjectId da franquia" />
            </div>
            <div className="form-group">
              <label>Preço Base</label>
              <input type="number" name="basePrice" value={form.basePrice} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Tarifa Mínima</label>
              <input type="number" name="minimumRate" value={form.minimumRate} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Valor Fixo</label>
              <input type="number" name="fixedValue" value={form.fixedValue} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Preço Hora</label>
              <input type="number" name="hourlyPrice" value={form.hourlyPrice} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Raio de Entrega (km)</label>
              <input type="number" name="radiusSendRace" value={form.radiusSendRace} onChange={change} step="0.1" min="0" />
            </div>
            <div className="form-group">
              <label>Distância Base (km)</label>
              <input type="number" name="baseDistance" value={form.baseDistance} onChange={change} step="0.1" min="0" />
            </div>
            <div className="form-group">
              <label>Preço Tempo</label>
              <input type="number" name="timePrice" value={form.timePrice} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Preço Moeda</label>
              <input type="number" name="currencyPrice" value={form.currencyPrice} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Minutos Dispensa</label>
              <input type="number" name="dispensingMinutes" value={form.dispensingMinutes} onChange={change} min="0" />
            </div>
            <div className="form-group">
              <label>Taxa por Minuto</label>
              <input type="number" name="ratePerMinute" value={form.ratePerMinute} onChange={change} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Valor %</label>
              <input type="number" name="valueByPercentage" value={form.valueByPercentage} onChange={change} step="0.01" min="0" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label>Informações</label>
            <textarea name="info" value={form.info} onChange={change} rows="3" style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" name="onlyForWomen" checked={form.onlyForWomen} onChange={change} /> Somente Mulheres
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" name="requireConfirmationCode" checked={form.requireConfirmationCode} onChange={change} /> Exige Confirmação
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" name="showArrivalTime" checked={form.showArrivalTime} onChange={change} /> Mostrar Tempo Chegada
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" name="useDynamicsRace" checked={form.useDynamicsRace} onChange={change} /> Dinâmica Corrida
            </label>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default MobilityServices;
