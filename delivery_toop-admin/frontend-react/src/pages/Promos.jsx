import React, { useState, useEffect } from 'react';
import { Plus, Ticket, X } from 'lucide-react';
import { promoService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minValue: '',
  maxDiscount: '',
  usesPerUser: '',
  expiresAt: '',
  active: true,
});

const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await promoService.getPromos();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPromos(data);
    } catch (e) {
      console.error('Erro ao carregar cupons:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (v) => v == null || v === '' ? '' : v;

  const handleCreate = () => {
    setSelected(null);
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setFormData({
      code: item.code || '',
      description: item.description || '',
      discountType: item.discountType || 'percent',
      discountValue: formatValue(item.discountValue),
      minValue: formatValue(item.minValue),
      maxDiscount: formatValue(item.maxDiscount),
      usesPerUser: formatValue(item.usesPerUser),
      expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : '',
      active: item.active !== false,
    });
    setModalOpen(true);
  };

  const handleToggle = async (item) => {
    try {
      await promoService.togglePromo(item._id);
      loadData();
    } catch (e) {
      alert('Erro ao alternar: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir cupom "${item.code}"?`)) return;
    try {
      await promoService.deletePromo(item._id);
      loadData();
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
      const payload = {
        code: formData.code,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minValue: formData.minValue === '' ? undefined : parseFloat(formData.minValue),
        maxDiscount: formData.maxDiscount === '' ? undefined : parseFloat(formData.maxDiscount),
        usesPerUser: formData.usesPerUser === '' ? undefined : parseInt(formData.usesPerUser, 10),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        active: formData.active,
      };
      if (selected) {
        await promoService.updatePromo(selected._id, payload);
      } else {
        await promoService.createPromo(payload);
      }
      loadData();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'code', title: 'Código', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <Ticket size={16} color="#8b5cf6" /> {val}
      </div>
    )},
    { key: 'description', title: 'Descrição', render: (val) => val || '-' },
    { key: 'discountValue', title: 'Desconto', render: (val, item) => (
      <strong>{item.discountType === 'percent' ? `${val}%` : `R$ ${Number(val).toFixed(2)}`}</strong>
    )},
    { key: 'minValue', title: 'Valor Mín.', render: (val) => val ? `R$ ${Number(val).toFixed(2)}` : '-' },
    { key: 'maxDiscount', title: 'Máx. Desc.', render: (val) => val ? `R$ ${Number(val).toFixed(2)}` : '-' },
    { key: 'usesPerUser', title: 'Uso/Usuário', render: (val) => val || '∞' },
    { key: 'expiresAt', title: 'Expira', render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-' },
    { key: 'active', title: 'Status', render: (val, item) => (
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
          <h3><Ticket size={20} style={{ marginRight: '0.5rem' }} />Cupons de Desconto</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Cupom
          </button>
        </div>
        <DataTable data={promos} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhum cupom encontrado" />
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Código *</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="Ex: GOJA10" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Descrição do cupom" />
              </div>
              <div className="form-group">
                <label>Tipo de desconto</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange}>
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Valor do desconto *</label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min={0} step="0.01" placeholder={formData.discountType === 'percent' ? 'Ex: 10' : 'Ex: 10.00'} />
              </div>
              <div className="form-group">
                <label>Valor mínimo (R$)</label>
                <input type="number" name="minValue" value={formData.minValue} onChange={handleChange} min={0} step="0.01" placeholder="Ex: 20.00" />
              </div>
              <div className="form-group">
                <label>Desconto máximo (R$)</label>
                <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} min={0} step="0.01" placeholder="Ex: 15.00" />
              </div>
              <div className="form-group">
                <label>Uso por usuário</label>
                <input type="number" name="usesPerUser" value={formData.usesPerUser} onChange={handleChange} min={1} placeholder="Vazio = ilimitado" />
              </div>
              <div className="form-group">
                <label>Expira em</label>
                <input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
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

export default Promos;