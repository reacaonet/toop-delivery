import React, { useState, useEffect } from 'react';
import { Plus, X, Store } from 'lucide-react';
import { franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({
  name: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  cep: '',
  status: true,
  activateTip: true,
  percentService: 5,
  fixedservicefee: 0,
  coin: 'R$',
  languageDefault: 'pt-BR',
  serviceDefault: 'delivery',
  emergencyPhone: '190',
  onlyMultiplesOf50: false,
});

const Franchises = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await franchiseService.getFranchises({ page: 1, limit: 100 });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setItems(data);
    } catch (e) {
      console.error('Erro ao carregar franquias:', e);
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
      name: item.name || '',
      companyName: item.companyName || '',
      email: item.email || '',
      phone: item.phone ?? '',
      address: item.address || '',
      cep: item.cep ?? '',
      status: item.status !== false,
      activateTip: item.activateTip !== false,
      percentService: item.percentService ?? 5,
      fixedservicefee: item.fixedservicefee ?? 0,
      coin: item.coin || 'R$',
      languageDefault: item.languageDefault || 'pt-BR',
      serviceDefault: item.serviceDefault || 'delivery',
      emergencyPhone: item.emergencyPhone || '190',
      onlyMultiplesOf50: !!item.onlyMultiplesOf50,
    });
    setModalOpen(true);
  };

  const handleToggle = async (item) => {
    try {
      await franchiseService.updateFranchise(item._id, { status: !item.status });
      load();
    } catch (e) {
      alert('Erro ao alternar: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir franquia "${item.name}"?`)) return;
    try {
      await franchiseService.deleteFranchise(item._id);
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
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone ? Number(formData.phone) : undefined,
        address: formData.address || undefined,
        cep: formData.cep ? Number(formData.cep) : undefined,
        status: formData.status ? 'true' : 'false',
        activateTip: formData.activateTip,
        percentService: Number(formData.percentService),
        fixedservicefee: Number(formData.fixedservicefee),
        coin: formData.coin,
        languageDefault: formData.languageDefault,
        serviceDefault: formData.serviceDefault,
        emergencyPhone: formData.emergencyPhone,
        onlyMultiplesOf50: formData.onlyMultiplesOf50,
      };
      if (selected) {
        await franchiseService.updateFranchise(selected._id, payload);
      } else {
        await franchiseService.createFranchise(payload);
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
        <Store size={16} color="#10b981" /> {val}
      </div>
    )},
    { key: 'companyName', title: 'Razão Social', render: (val) => val || '-' },
    { key: 'email', title: 'E-mail', render: (val) => val || '-' },
    { key: 'phone', title: 'Telefone', render: (val) => val || '-' },
    { key: 'coin', title: 'Moeda', render: (val) => val || '-' },
    { key: 'percentService', title: '% Serviço', render: (val) => `${val ?? 0}%` },
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
          <h3><Store size={20} style={{ marginRight: '0.5rem' }} />Franquias</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Franquia
          </button>
        </div>

        <DataTable data={items} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma franquia encontrada" />
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Franquia' : 'Nova Franquia'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Franquia Centro" />
              </div>
              <div className="form-group">
                <label>Razão Social *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Ex: Franquia Centro LTDA" />
              </div>
              <div className="form-group">
                <label>E-mail *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="contato@franquia.com.br" />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ex: 5511999999999" />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input type="number" name="cep" value={formData.cep} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Telefone de emergência</label>
                <input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>% Serviço</label>
                <input type="number" name="percentService" value={formData.percentService} onChange={handleChange} min={0} max={100} step="0.01" />
              </div>
              <div className="form-group">
                <label>Taxa fixa de serviço</label>
                <input type="number" name="fixedservicefee" value={formData.fixedservicefee} onChange={handleChange} min={0} step="0.01" />
              </div>
              <div className="form-group">
                <label>Moeda</label>
                <select name="coin" value={formData.coin} onChange={handleChange}>
                  {['R$', '€', '$', '₲', 'Kz'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Idioma</label>
                <select name="languageDefault" value={formData.languageDefault} onChange={handleChange}>
                  {['pt-BR', 'pt-PT', 'pt-AO', 'pt'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Serviço padrão</label>
                <select name="serviceDefault" value={formData.serviceDefault} onChange={handleChange}>
                  {['delivery', 'service', 'drive'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="activateTip" checked={formData.activateTip} onChange={handleChange} />
                  {' '}Ativar gorjeta
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="onlyMultiplesOf50" checked={formData.onlyMultiplesOf50} onChange={handleChange} />
                  {' '}Apenas múltiplos de 50
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

export default Franchises;