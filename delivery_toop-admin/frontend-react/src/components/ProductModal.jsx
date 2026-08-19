import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload } from 'lucide-react';
import api from '../services/api';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', promoPrice: '',
    category: '', company: '', image: '',
    preparationTime: '', active: true, available: true,
  });
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const isEdit = !!product;

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      if (product) {
        setFormData({
          name: product.name || '', description: product.description || '',
          price: product.price || '', promoPrice: product.promoPrice || '',
          category: product.category?._id || product.category || '',
          company: product.company?._id || product.company || '',
          image: product.image || '', preparationTime: product.preparationTime || '',
          active: product.active !== false, available: product.available !== false,
        });
        setImagePreview(product.image || '');
        loadCategories(product.company?._id || product.company || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, product]);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', promoPrice: '', category: '', company: '', image: '', preparationTime: '', active: true, available: true });
    setImagePreview('');
    setCategories([]);
  };

  const loadCompanies = async () => {
    try {
      const res = await api.get('/companies');
      const data = res.data?.data ?? res.data;
      setCompanies(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) { console.error(e); }
  };

  const loadCategories = async (companyId) => {
    if (!companyId) { setCategories([]); return; }
    try {
      const res = await api.get('/categories', { params: { company: companyId } });
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCategories(list);
    } catch (e) { console.error(e); }
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setFormData(prev => ({ ...prev, company: companyId, category: '' }));
    loadCategories(companyId);
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
      if (url) { setFormData(prev => ({ ...prev, image: url })); setImagePreview(url); }
    } catch (err) {
      alert('Erro ao enviar imagem: ' + (err.response?.data?.error || err.message));
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, price: Number(formData.price), promoPrice: formData.promoPrice ? Number(formData.promoPrice) : undefined, preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined };
      if (isEdit) {
        await api.put(`/products/${product._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nome do produto" />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Descrição do produto" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Empresa *</label>
              <select name="company" value={formData.company} onChange={handleCompanyChange} required>
                <option value="">Selecione</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Categoria *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Selecione</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Preço (R$) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min={0} step={0.01} />
            </div>
            <div className="form-group">
              <label>Promo (R$)</label>
              <input type="number" name="promoPrice" value={formData.promoPrice} onChange={handleChange} min={0} step={0.01} />
            </div>
            <div className="form-group">
              <label>Tempo Prep. (min)</label>
              <input type="number" name="preparationTime" value={formData.preparationTime} onChange={handleChange} min={0} />
            </div>
          </div>
          <div className="form-group">
            <label>Imagem</label>
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
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Ou cole a URL" style={{ marginTop: '0.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="form-group">
              <label><input type="checkbox" name="active" checked={formData.active} onChange={handleChange} /> {' '}Ativo</label>
            </div>
            <div className="form-group">
              <label><input type="checkbox" name="available" checked={formData.available} onChange={handleChange} /> {' '}Disponível</label>
            </div>
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

export default ProductModal;
