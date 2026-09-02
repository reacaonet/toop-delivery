import React, { useState, useEffect } from 'react';
import { Plus, X, Percent, Gift } from 'lucide-react';
import { cashbackService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({
  name: '',
  status: true,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  allApp: false,
  percent: '',
  amount: '',
});

const Cashback = () => {
  const [tab, setTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [used, setUsed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsed, setLoadingUsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    try {
      const res = await cashbackService.getCampaigns();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCampaigns(data);
    } catch (e) {
      console.error('Erro ao carregar campanhas:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsed = async () => {
    setLoadingUsed(true);
    try {
      const res = await cashbackService.getUsed({ pageIn: 0, pageOut: 100 });
      const data = Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : [];
      setUsed(data);
    } catch (e) {
      console.error('Erro ao carregar cashbacks usados:', e);
    } finally {
      setLoadingUsed(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    if (t === 'used' && used.length === 0) loadUsed();
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
      status: item.status !== false,
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      allApp: !!item.allApp,
      percent: item.percent ?? '',
      amount: item.amount ?? '',
    });
    setModalOpen(true);
  };

  const handleToggle = async (item) => {
    try {
      await cashbackService.updateCampaign(item._id, { status: !item.status });
      loadCampaigns();
    } catch (e) {
      alert('Erro ao alternar: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir campanha "${item.name}"?`)) return;
    try {
      await cashbackService.deleteCampaign(item._id);
      loadCampaigns();
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
        status: formData.status ? 'true' : 'false',
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        allApp: formData.allApp,
        percent: parseFloat(formData.percent),
        amount: parseFloat(formData.amount),
      };
      if (selected) {
        await cashbackService.updateCampaign(selected._id, payload);
      } else {
        await cashbackService.createCampaign(payload);
      }
      loadCampaigns();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const fmtMoney = (v) => v == null ? '-' : `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const campaignColumns = [
    { key: 'name', title: 'Nome', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <Gift size={16} color="#10b981" /> {val}
      </div>
    )},
    { key: 'percent', title: 'Percentual', render: (val) => `${val}%` },
    { key: 'amount', title: 'Provisão', render: (val) => fmtMoney(val) },
    { key: 'balance', title: 'Saldo', render: (val) => fmtMoney(val) },
    { key: 'allApp', title: 'Alcance', render: (val) => val ? 'Todos' : 'Empresas' },
    { key: 'startDate', title: 'Início', render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-' },
    { key: 'endDate', title: 'Fim', render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-' },
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

  const usedColumns = [
    { key: 'customer', title: 'Cliente', render: (val) => val?.name || '-' },
    { key: 'campaign', title: 'Campanha', render: (val) => val?.name || '-' },
    { key: 'order', title: 'Pedido', render: (val) => val?.orderNumber ? `#${val.orderNumber}` : '-' },
    { key: 'percent', title: 'Percentual', render: (val) => `${val}%` },
    { key: 'cash', title: 'Valor', render: (val) => fmtMoney(val) },
    { key: 'createdAt', title: 'Data', render: (val) => val ? new Date(val).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Percent size={20} style={{ marginRight: '0.5rem' }} />Cashback</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '8px', padding: '0.25rem' }}>
              {(['campaigns', 'used']).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: tab === t ? '#6366f1' : 'transparent',
                    color: tab === t ? '#fff' : '#64748b',
                  }}
                >
                  {t === 'campaigns' ? 'Campanhas' : 'Cashback Utilizado'}
                </button>
              ))}
            </div>
            {tab === 'campaigns' && (
              <button className="btn btn-primary" onClick={handleCreate}>
                <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Campanha
              </button>
            )}
          </div>
        </div>

        {tab === 'campaigns' ? (
          <DataTable data={campaigns} columns={campaignColumns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma campanha encontrada" />
        ) : (
          <DataTable data={used} columns={usedColumns} loading={loadingUsed} emptyMessage="Nenhum cashback utilizado" />
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Campanha' : 'Nova Campanha'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Cashback 10% de setembro" />
              </div>
              <div className="form-group">
                <label>Percentual (%) *</label>
                <input type="number" name="percent" value={formData.percent} onChange={handleChange} required min={0} max={100} step="0.01" placeholder="Ex: 10" />
              </div>
              <div className="form-group">
                <label>Valor provisionado (R$) *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min={0} step="0.01" placeholder="Ex: 1000.00" />
              </div>
              <div className="form-group">
                <label>Data de início</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Data de fim</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="allApp" checked={formData.allApp} onChange={handleChange} />
                  {' '}Aplicar para todas as empresas (allApp)
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

export default Cashback;
