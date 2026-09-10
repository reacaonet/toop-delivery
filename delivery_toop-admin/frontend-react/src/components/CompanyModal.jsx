import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Phone, MapPin, UserCog, Trash2, Plus } from 'lucide-react';
import { companyService } from '../services/api';

const CompanyModal = ({ isOpen, onClose, company, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
    phone: '',
    status: true
  });
  const [adminData, setAdminData] = useState({ name: '', email: '', password: '' });
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!company;

  const emptyForm = { name: '', address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }, phone: '', status: true };

  useEffect(() => {
    if (isOpen) {
      if (company) {
        const addr = company.address && typeof company.address === 'object' ? company.address : {};
        setFormData({
          name: company.name || '',
          address: { street: addr.street || '', number: addr.number || '', neighborhood: addr.neighborhood || '', city: addr.city || '', state: addr.state || '', zipCode: addr.zipCode || '' },
          phone: company.phone || '',
          status: company.active ?? company.status ?? true
        });
        loadAdmins(company._id);
      } else {
        setFormData(emptyForm);
        setAdmins([]);
      }
      setAdminData({ name: '', email: '', password: '' });
    }
  }, [isOpen, company]);

  const loadAdmins = async (id) => {
    setAdminsLoading(true);
    try {
      const data = await companyService.getCompanyAdmins(id);
      setAdmins(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  };

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
      setFormData(emptyForm);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async () => {
    if (!adminData.name.trim() || !adminData.email.trim()) {
      alert('Preencha nome e email do admin');
      return;
    }
    if (adminData.password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setAddingAdmin(true);
    try {
      await companyService.addCompanyAdmin(company._id, adminData);
      await loadAdmins(company._id);
      setAdminData({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
      alert('Erro ao adicionar admin: ' + (error.response?.data?.error || error.message));
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (admin) => {
    if (!window.confirm(`Remover o acesso do admin "${admin.name}" a esta empresa?`)) {
      return;
    }
    try {
      await companyService.removeCompanyAdmin(company._id, admin._id);
      await loadAdmins(company._id);
      onSave && onSave();
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      alert('Erro ao remover admin: ' + (error.response?.data?.error || error.message));
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

          {isEdit && (
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCog size={16} />
                Usuário Admin
              </label>

              <div className="admin-list" style={{ marginBottom: '0.75rem' }}>
                {adminsLoading ? (
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                ) : admins.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Nenhum admin vinculado a esta empresa.</p>
                ) : (
                  admins.map((admin) => (
                    <div
                      key={admin._id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.4rem 0.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem', marginBottom: '0.375rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem' }}>{admin.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{admin.email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!admin.active && (
                          <span className="status-badge status-inactive">Inativo</span>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveAdmin(admin)}
                          style={{ padding: '0.4rem' }}
                          title="Remover admin"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-add-form">
                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={adminData.name}
                    onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do admin"
                  />
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email do admin"
                  />
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha (mín. 6 caracteres)"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={addingAdmin}
                  onClick={handleAdminSubmit}
                  style={{ width: '100%' }}
                >
                  {addingAdmin ? (
                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <>
                      <Plus size={16} style={{ marginRight: '0.5rem' }} />
                      Adicionar Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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