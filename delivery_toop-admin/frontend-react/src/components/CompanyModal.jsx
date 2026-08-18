import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Phone, MapPin } from 'lucide-react';
import { companyService } from '../services/api';

const CompanyModal = ({ isOpen, onClose, company, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
    phone: '',
    status: true
  });
  const [loading, setLoading] = useState(false);

  const isEdit = !!company;

  useEffect(() => {
    if (isOpen) {
      if (company) {
        const addr = company.address && typeof company.address === 'object' ? company.address : {};
        setFormData({
          name: company.name || '',
          address: { street: addr.street || '', number: addr.number || '', neighborhood: addr.neighborhood || '', city: addr.city || '', state: addr.state || '', zipCode: addr.zipCode || '' },
          phone: company.phone || '',
          status: company.status || false
        });
      } else {
        setFormData({
          name: '',
          address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
          phone: '',
          status: true
        });
      }
    }
  }, [isOpen, company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isEdit) {
        response = await companyService.updateCompany(company._id, formData);
      } else {
        response = await companyService.createCompany(formData);
      }

      onSave(response);
      onClose();
      setFormData({ name: '', address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }, phone: '', status: true });
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <Building2 size={16} style={{ marginRight: '0.5rem' }} />
              Nome *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nome da empresa"
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={16} style={{ marginRight: '0.5rem' }} />
              Endereço
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem' }}>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                placeholder="Rua"
              />
              <input
                type="text"
                value={formData.address.number}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))}
                placeholder="Nº"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                value={formData.address.neighborhood}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, neighborhood: e.target.value } }))}
                placeholder="Bairro"
              />
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                placeholder="CEP"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 50px', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                placeholder="Cidade"
              />
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <Phone size={16} style={{ marginRight: '0.5rem' }} />
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              Status Ativo
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <>
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;
