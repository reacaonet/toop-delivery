import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload } from 'lucide-react';
import api from '../services/api';

const BannerModal = ({ isOpen, onClose, banner, onSave }) => {
  const [formData, setFormData] = useState({
    title: '', subtitle: '', image: '', link: '',
    company: '', order: 0, active: true,
    startDate: '', endDate: '',
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const isEdit = !!banner;

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      if (banner) {
        setFormData({
          title: banner.title || '', subtitle: banner.subtitle || '',
          image: banner.image || '', link: banner.link || '',
          company: banner.company?._id || banner.company || '',
          order: banner.order || 0, active: banner.active !== false,
          startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
          endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
        });
        setImagePreview(banner.image || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, banner]);

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image: '', link: '', company: '', order: 0, active: true, startDate: '', endDate: '' });
    setImagePreview('');
  };

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
      const url = res.data?.url;
      if (url) { setFormData(prev => ({ ...prev, image: url })); setImagePreview(url); }
    } catch (err) {
      alert('Erro ao enviar imagem: ' + (err.response?.data?.error || err.message));
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, order: Number(formData.order) };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.company) delete payload.company;
      if (isEdit) {
        await api.put(`/banners/${banner._id}`, payload);
      } else {
        await api.post('/banners', payload);
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
      <div className="modal" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Banner' : 'Novo Banner'}</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Título do banner" />
          </div>
          <div className="form-group">
            <label>Subtítulo</label>
            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtítulo do banner" />
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
                <img src={imagePreview} alt="Preview" style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              )}
            </div>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Ou cole a URL" style={{ marginTop: '0.5rem' }} />
          </div>
          <div className="form-group">
            <label>Link (opcional)</label>
            <input type="text" name="link" value={formData.link} onChange={handleChange} placeholder="URL para redirecionar ao clicar" />
          </div>
          <div className="form-group">
            <label>Empresa (opcional - vazio = todas)</label>
            <select name="company" value={formData.company} onChange={handleChange}>
              <option value="">Todas as empresas</option>
              {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ordem</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} min={0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Data Início</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Data Fim</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label><input type="checkbox" name="active" checked={formData.active} onChange={handleChange} /> {' '}Ativo</label>
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

export default BannerModal;
