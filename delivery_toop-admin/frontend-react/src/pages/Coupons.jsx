import React, { useState, useEffect } from 'react';
import { Plus, BadgePercent, X, ShoppingBag } from 'lucide-react';
import { couponService, companyService } from '../services/api';
import DataTable from '../components/DataTable';

const emptyForm = () => ({
  name: '',
  description: '',
  rules: '',
  price: '',
  discountPercentage: '',
  dateInit: '',
  dateFinish: '',
  status: true,
  minPriceDelivery: '',
  limit: 1,
  onlyFirstPurchase: false,
  allCompanies: false,
  companies: [],
});

const Coupons = () => {
  const [tab, setTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [used, setUsed] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponRes, companyRes] = await Promise.all([
        couponService.getCoupons(),
        companyService.getCompanies(),
      ]);
      const couponList = Array.isArray(couponRes?.data) ? couponRes.data : Array.isArray(couponRes) ? couponRes : [];
      const companyList = Array.isArray(companyRes?.data) ? companyRes.data : Array.isArray(companyRes) ? companyRes : [];
      setCoupons(couponList);
      setCompanies(companyList);
    } catch (e) {
      console.error('Erro ao carregar cupons:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsed = async () => {
    try {
      const res = await couponService.getUsed({ pageIn: 0, pageOut: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setUsed(list);
    } catch (e) {
      console.error('Erro ao carregar usos:', e);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    if (t === 'used') loadUsed();
  };

  const fmt = (v) => v == null || v === '' ? '' : v;
  const toDate = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

  const handleCreate = () => {
    setSelected(null);
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      rules: item.rules || '',
      price: fmt(item.price),
      discountPercentage: fmt(item.discountPercentage),
      dateInit: toDate(item.dateInit),
      dateFinish: toDate(item.dateFinish),
      status: item.status !== false,
      minPriceDelivery: fmt(item.minPriceDelivery),
      limit: item.limit ?? 1,
      onlyFirstPurchase: !!item.onlyFirstPurchase,
      allCompanies: !!item.allCompanies,
      companies: item.companies || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir cupom "${item.name}"?`)) return;
    try {
      await couponService.deleteCoupon(item._id);
      loadData();
    } catch (e) {
      alert('Erro ao excluir: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleCompany = (id) => {
    setFormData(prev => {
      const has = prev.companies.includes(id);
      return { ...prev, companies: has ? prev.companies.filter(c => c !== id) : [...prev.companies, id] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        rules: formData.rules || '',
        price: parseFloat(formData.price || 0),
        discountPercentage: parseFloat(formData.discountPercentage || 0),
        dateInit: formData.dateInit ? new Date(formData.dateInit).toISOString() : undefined,
        dateFinish: formData.dateFinish ? new Date(formData.dateFinish).toISOString() : undefined,
        status: formData.status,
        minPriceDelivery: parseFloat(formData.minPriceDelivery || 0),
        limit: parseInt(formData.limit, 10) || 1,
        onlyFirstPurchase: formData.onlyFirstPurchase,
        allCompanies: formData.allCompanies,
        companies: formData.allCompanies ? [] : formData.companies,
      };
      if (selected) {
        await couponService.updateCoupon(selected._id, payload);
      } else {
        await couponService.createCoupon(payload);
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
    { key: 'name', title: 'Nome', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <BadgePercent size={16} color="#8b5cf6" /> {val}
      </div>
    )},
    { key: 'price', title: 'Preço', render: (val) => `R$ ${Number(val).toFixed(2)}` },
    { key: 'discountPercentage', title: 'Desconto', render: (val) => <strong>{val}%</strong> },
    { key: 'allCompanies', title: 'Empresas', render: (val) => val === true ? 'Todas' : (val && val.length ? `${val.length} empresa(s)` : '-') },
    { key: 'minPriceDelivery', title: 'Ped. Mín.', render: (val) => `R$ ${Number(val).toFixed(2)}` },
    { key: 'limit', title: 'Limite', render: (val) => val || '∞' },
    { key: 'onlyFirstPurchase', title: '1ª Compra', render: (val) => val ? 'Sim' : 'Não' },
    { key: 'dateInit', title: 'Vigência', render: (val, item) => (
      <span style={{ fontSize: '0.8rem' }}>
        {toDate(val).slice(0, 10)} → {toDate(item.dateFinish).slice(0, 10)}
      </span>
    )},
    { key: 'status', title: 'Status', render: (val) => (
      <span className={`badge ${val ? 'badge-success' : 'badge-secondary'}`}>{val ? 'Ativo' : 'Inativo'}</span>
    )},
  ];

  const usedColumns = [
    { key: 'customer', title: 'Cliente', render: (val) => val?.name || '-' },
    { key: 'coupon', title: 'Cupom', render: (val) => val?.name || '-' },
    { key: 'company', title: 'Empresa', render: (val) => val?.name || '-' },
    { key: 'createdAt', title: 'Usado em', render: (val) => val ? new Date(val).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><BadgePercent size={20} style={{ marginRight: '0.5rem' }} />Cupons Compráveis</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className={`btn ${tab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchTab('coupons')}>Cupons</button>
            <button className={`btn ${tab === 'used' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchTab('used')}>
              <ShoppingBag size={16} style={{ marginRight: '.4rem' }} />Utilizados
            </button>
            {tab === 'coupons' && (
              <button className="btn btn-primary" onClick={handleCreate}>
                <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Cupom
              </button>
            )}
          </div>
        </div>
        {tab === 'coupons' ? (
          <DataTable data={coupons} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhum cupom encontrado" />
        ) : (
          <DataTable data={used} columns={usedColumns} loading={loading} emptyMessage="Nenhum cupom utilizado" />
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Cupom 15% off" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Descrição do cupom" />
              </div>
              <div className="form-group">
                <label>Regras</label>
                <textarea name="rules" value={formData.rules} onChange={handleChange} rows="2" placeholder="Regras de uso" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min={0} step="0.01" />
                </div>
                <div className="form-group">
                  <label>Desconto (%) *</label>
                  <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required min={0} max={100} step="0.01" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Início</label>
                  <input type="datetime-local" name="dateInit" value={formData.dateInit} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Fim</label>
                  <input type="datetime-local" name="dateFinish" value={formData.dateFinish} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pedido mínimo (R$)</label>
                  <input type="number" name="minPriceDelivery" value={formData.minPriceDelivery} onChange={handleChange} min={0} step="0.01" />
                </div>
                <div className="form-group">
                  <label>Limite de uso</label>
                  <input type="number" name="limit" value={formData.limit} onChange={handleChange} min={1} />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="onlyFirstPurchase" checked={formData.onlyFirstPurchase} onChange={handleChange} />
                  {' '}Apenas primeira compra
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="allCompanies" checked={formData.allCompanies} onChange={handleChange} />
                  {' '}Válido para todas as empresas
                </label>
              </div>
              {!formData.allCompanies && (
                <div className="form-group">
                  <label>Empresas</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }}>
                    {companies.map(c => (
                      <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={formData.companies.includes(c._id)} onChange={() => toggleCompany(c._id)} />
                        {c.name}
                      </label>
                    ))}
                    {companies.length === 0 && <span style={{ fontSize: '0.8rem', color: '#888' }}>Nenhuma empresa cadastrada.</span>}
                  </div>
                </div>
              )}
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

export default Coupons;
