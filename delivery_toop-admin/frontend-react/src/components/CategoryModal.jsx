import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../services/api';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    active: true,
  });
  const [loading, setLoading] = useState(false);

  const isEdit = !!category;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '',
          order: category.order || 0,
          active: category.active !== false,
        });
      } else {
        setFormData({ name: '', description: '', icon: '', order: 0, active: true });
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/categories/${category._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (!isOpen) return null;

  const presetIcons = ['🍔', '🍕', '🥤', '🍰', '🎉', '🍣', '🧆', '🍱', '💜', '☕', '🥗', '🍜', '🌮', '🍗', '🍟', '🥩', '🥘', '🫕', '🍩', '🧁'];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nome da categoria" />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Descrição da categoria" />
          </div>
          <div className="form-group">
            <label>Ícone (emoji)</label>
            <input type="text" name="icon" value={formData.icon} onChange={handleChange} placeholder="Ex: 🍔" maxLength={4} style={{ fontSize: '1.5rem', width: '80px', textAlign: 'center' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {presetIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  style={{
                    fontSize: '1.25rem', padding: '0.35rem', border: formData.icon === icon ? '2px solid #667eea' : '1px solid #e5e7eb',
                    borderRadius: 6, background: formData.icon === icon ? '#f0f0ff' : 'white', cursor: 'pointer',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Ordem</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} min={0} />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
              {' '}Ativo
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Save size={16} style={{ marginRight: '0.5rem' }} />Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
