import React, { useState, useEffect } from 'react';
import { Plus, Car, X, Save } from 'lucide-react';
import { rideCategoryService } from '../services/api';
import DataTable from '../components/DataTable';

const EMPTY_FORM = {
  vehicleType: 'car', code: '', label: '', icon: '🚗',
  description: '', multiplier: 1, basePrice: '', perKm: '', active: true, sortOrder: 0,
};

const RideCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await rideCategoryService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Erro ao carregar categorias:', e);
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setSelected(null);
    setForm({ ...EMPTY_FORM, vehicleType: 'car', code: 'car_', icon: '🚗' });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setForm({
      vehicleType: item.vehicleType || 'car',
      code: item.code || '',
      label: item.label || '',
      icon: item.icon || '🚗',
      description: item.description || '',
      multiplier: item.multiplier ?? 1,
      basePrice: item.basePrice ?? '',
      perKm: item.perKm ?? '',
      active: item.active !== false,
      sortOrder: item.sortOrder ?? 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Desativar categoria "${item.label}"?`)) return;
    try { await rideCategoryService.remove(item._id); loadData(); }
    catch (e) { alert('Erro: ' + (e.response?.data?.error || e.message)); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        multiplier: parseFloat(form.multiplier) || 1,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (payload.basePrice === '' || payload.basePrice === null) delete payload.basePrice;
      else payload.basePrice = parseFloat(payload.basePrice);
      if (payload.perKm === '' || payload.perKm === null) delete payload.perKm;
      else payload.perKm = parseFloat(payload.perKm);

      if (selected) await rideCategoryService.update(selected._id, payload);
      else await rideCategoryService.create(payload);
      loadData();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally { setSaving(false); }
  };

  const columns = [
    { key: 'label', title: 'Categoria', render: (val, item) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>{item.icon || '🚗'}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.code}</div>
        </div>
      </div>
    )},
    { key: 'vehicleType', title: 'Veículo', render: (val) => (
      <span className={`status-badge ${val === 'car' ? 'status-active' : val === 'taxi' ? 'status-info' : 'status-warning'}`}>
        {val === 'car' ? '🚗 Carro' : val === 'taxi' ? '🚕 Táxi' : '🏍️ Moto'}
      </span>
    )},
    { key: 'multiplier', title: 'Multiplicador', render: (val) => (
      <span style={{ fontWeight: 700, color: '#667eea' }}>{(val || 1).toFixed(2)}x</span>
    )},
    { key: 'description', title: 'Descrição', render: (val) => val || '-' },
    { key: 'active', title: 'Status', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>{val ? 'Ativo' : 'Inativo'}</span>
    )},
    { key: 'sortOrder', title: 'Ordem' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Categorias de Veículos (Corridas)</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Categoria
          </button>
        </div>
        <DataTable data={items} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma categoria encontrada" />
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo de Veículo *</label>
                  <select name="vehicleType" value={form.vehicleType} onChange={handleChange} required>
                    <option value="car">🚗 Carro</option>
                    <option value="moto">🏍️ Moto</option>
                    <option value="taxi">🚕 Táxi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Código *</label>
                  <input type="text" name="code" value={form.code} onChange={handleChange} required placeholder="ex: car_comfort" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" name="label" value={form.label} onChange={handleChange} required placeholder="ex: Confort" />
                </div>
                <div className="form-group">
                  <label>Ícone (emoji)</label>
                  <input type="text" name="icon" value={form.icon} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Breve descrição exibida ao cliente" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Multiplicador *</label>
                  <input type="number" name="multiplier" value={form.multiplier} onChange={handleChange} min={0.1} step={0.05} />
                </div>
                <div className="form-group">
                  <label>Tarifa Base (opcional)</label>
                  <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} min={0} step={0.5} placeholder="auto" />
                </div>
                <div className="form-group">
                  <label>Preço/km (opcional)</label>
                  <input type="number" name="perKm" value={form.perKm} onChange={handleChange} min={0} step={0.1} placeholder="auto" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Ordem</label>
                  <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} min={0} />
                </div>
                <div className="form-group">
                  <label><input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> {' '}Ativo</label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Save size={16} style={{ marginRight: '0.5rem' }} />Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideCategories;