import React, { useState, useEffect } from 'react';
import { Plus, X, ShoppingBag } from 'lucide-react';
import { shopperService, companyService, userService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({
  isOnline: false,
  person: '',
  company: '',
  device: '',
  token: '',
  appVersion: '',
  status: true,
});

const Shoppers = () => {
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [shopperRes, companyRes, userRes] = await Promise.all([
        shopperService.getShoppers({ page: 1, limit: 100 }),
        companyService.getCompanies(),
        userService.getUsers().catch(() => []),
      ]);
      const shopperList = Array.isArray(shopperRes?.data) ? shopperRes.data : Array.isArray(shopperRes) ? shopperRes : [];
      const companyList = Array.isArray(companyRes?.data) ? companyRes.data : Array.isArray(companyRes) ? companyRes : [];
      const userList = Array.isArray(userRes?.data) ? userRes.data : Array.isArray(userRes) ? userRes : [];
      setItems(shopperList);
      setCompanies(companyList);
      setUsers(userList);
    } catch (e) {
      console.error('Erro ao carregar shoppers:', e);
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
    setFormData({
      isOnline: !!item.isOnline,
      person: item.person?._id || item.person || '',
      company: item.company?._id || item.company || '',
      device: item.device || '',
      token: item.token || '',
      appVersion: item.appVersion || '',
      status: item.status !== false,
    });
    setModalOpen(true);
  };

  const handleToggle = async (item, field) => {
    try {
      await shopperService.updateShopper(item._id, { [field]: !item[field] });
      load();
    } catch (e) {
      alert('Erro ao alternar: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Excluir shopper?')) return;
    try {
      await shopperService.deleteShopper(item._id);
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
      const payload = {
        isOnline: formData.isOnline ? 'true' : 'false',
        person: formData.person || undefined,
        company: formData.company,
        device: formData.device || undefined,
        token: formData.token || undefined,
        appVersion: formData.appVersion || undefined,
        status: formData.status ? 'true' : 'false',
      };
      if (selected) {
        await shopperService.updateShopper(selected._id, payload);
      } else {
        await shopperService.createShopper(payload);
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
    { key: 'person', title: 'Pessoa', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <ShoppingBag size={16} color="#10b981" /> {val?.name || '-'}
      </div>
    )},
    { key: 'company', title: 'Empresa', render: (val) => val?.name || '-' },
    { key: 'device', title: 'Dispositivo', render: (val) => val || '-' },
    { key: 'appVersion', title: 'Versão App', render: (val) => val || '-' },
    { key: 'isOnline', title: 'Online', render: (val, item) => (
      <button
        className={`btn ${val ? 'btn-primary' : 'btn-secondary'}`}
        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        onClick={() => handleToggle(item, 'isOnline')}
      >
        {val ? 'Online' : 'Offline'}
      </button>
    )},
    { key: 'status', title: 'Status', render: (val, item) => (
      <button
        className={`btn ${val ? 'btn-primary' : 'btn-secondary'}`}
        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        onClick={() => handleToggle(item, 'status')}
      >
        {val ? 'Ativo' : 'Inativo'}
      </button>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><ShoppingBag size={20} style={{ marginRight: '0.5rem' }} />Shoppers</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Shopper
          </button>
        </div>

        <DataTable data={items} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhum shopper encontrado" />
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Shopper' : 'Novo Shopper'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Empresa *</label>
                <select name="company" value={formData.company} onChange={handleChange} required>
                  <option value="">Selecione a empresa</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Pessoa (usuário)</label>
                <select name="person" value={formData.person} onChange={handleChange}>
                  <option value="">Nenhuma</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dispositivo</label>
                <input type="text" name="device" value={formData.device} onChange={handleChange} placeholder="Ex: iPhone 12 / Android" />
              </div>
              <div className="form-group">
                <label>Token</label>
                <input type="text" name="token" value={formData.token} onChange={handleChange} placeholder="Token de push" />
              </div>
              <div className="form-group">
                <label>Versão do App</label>
                <input type="text" name="appVersion" value={formData.appVersion} onChange={handleChange} placeholder="Ex: 1.0.0" />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} />
                  {' '}Online
                </label>
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

export default Shoppers;