import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Image } from 'lucide-react';
import api from '../services/api';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    company: '',
    active: true,
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const isEdit = !!category;

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          image: category.image || '',
          order: category.order || 0,
          company: category.company?._id || category.company || '',
          active: category.active !== false,
        });
        setImagePreview(category.image || '');
      } else {
        setFormData({ name: '', description: '', image: '', order: 0, company: '', active: true });
        setImagePreview('');
      }
    }
  }, [isOpen, category]);

  const loadCompanies = async () => {
    try {
      const res = await api.get('/companies');
      const data = res.data?.data ?? res.data;
      setCompanies(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) { console.error(e); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
        setImagePreview(url);
      }
    } catch (err) {
      alert('Erro ao enviar imagem: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

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
            <label>Empresa *</label>
            <select name="company" value={formData.company} onChange={handleChange} required>
              <option value="">Selecione uma empresa</option>
              {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ícone / Imagem</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload size={16} style={{ marginRight: '0.5rem' }} />
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
              </button>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              )}
            </div>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Ou cole a URL da imagem" style={{ marginTop: '0.5rem' }} />
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
