import React, { useState, useEffect } from 'react';
import { Plus, X, Package } from 'lucide-react';
import { packingService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({ name: '', status: true });

const Packings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await packingService.getPackings({ page: 1, limit: 100 });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setItems(data);
    } catch (e) {
      console.error('Erro ao carregar embalagens:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setFormData({ name: item.name || '', status: item.status !== false });
    setModalOpen(true);
  };

  const handleToggle = async (item) => {
    try {
      await packingService.updatePacking(item._id, { status: !item.status });
      load();
    } catch (e) {
      alert('Erro ao alternar: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir embalagem "${item.name}"?`)) return;
    try {
      await packingService.deletePacking(item._id);
      load();
    } catch (e) {
      alert('Erro ao excluir: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: formData.name, status: formData.status ? 'true' : 'false' };
      if (selected) {
        await packingService.updatePacking(selected._id, payload);
      } else {
        await packingService.createPacking(payload);
      }
      load();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', title: 'Nome', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <Package size={16} color="#10b981" /> {val}
      </div>
    )},
    { key: 'status', title: 'Status', render: (val, item) => (
      <button
        className={`btn ${val ? 'btn-primary' : 'btn-secondary'}`}
        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        onClick={() => handleToggle(item)}
      >
        {val ? 'Ativo' : 'Inativo'}
      </button>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Package size={20} style={{ marginRight: '0.5rem' }} />Embalagens / Packing</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Embalagem
          </button>
        </div>

        <DataTable data={items} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma embalagem encontrada" />
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Embalagem' : 'Nova Embalagem'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Caixa de papelão 30x30" />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                  {' '}Ativo
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
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

export default Packings;