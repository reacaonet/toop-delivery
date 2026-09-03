import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Banknote,
  Building2,
  Landmark as LandmarkIcon,
  Wallet,
  RotateCcw,
  Scale,
  Plus,
  X,
} from 'lucide-react';
import { financeService, companyService } from '../services/api';
import DataTable from '../components/DataTable';

const TABS = [
  { key: 'balances', label: 'Balanços', icon: Scale },
  { key: 'costCenters', label: 'Centros de Custo', icon: Wallet },
  { key: 'typePayments', label: 'Tipos de Pagamento', icon: Banknote },
  { key: 'banks', label: 'Bancos', icon: Landmark },
  { key: 'agencies', label: 'Agências', icon: Building2 },
  { key: 'digitalAccounts', label: 'Contas Digitais', icon: Wallet },
  { key: 'chargebacks', label: 'Chargebacks', icon: RotateCcw },
];

const currency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const Finance = () => {
  const [tab, setTab] = useState('balances');

  const switchTab = (key) => {
    setTab(key);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><LandmarkIcon size={20} style={{ marginRight: '0.5rem' }} />Financeiro</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.9rem', cursor: 'pointer', borderRadius: '8px',
                  border: active ? '1px solid #10b981' : '1px solid transparent',
                  background: active ? '#ecfdf5' : 'transparent',
                  color: active ? '#047857' : '#4b5563',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <Icon size={16} />{t.label}
              </button>
            );
          })}
        </div>
        <div style={{ padding: '1rem' }}>
          {tab === 'balances' && <BalancesTab />}
          {tab === 'costCenters' && <CostCentersTab />}
          {tab === 'typePayments' && <TypePaymentsTab />}
          {tab === 'banks' && <BanksTab />}
          {tab === 'agencies' && <AgenciesTab />}
          {tab === 'digitalAccounts' && <DigitalAccountsTab />}
          {tab === 'chargebacks' && <ChargebacksTab />}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Balances ---------------- */
const BalancesTab = () => {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await financeService.listBalances({});
      setTotals(res?.totals || null);
      setRows(extractList(res?.companies));
    } catch (e) {
      console.error('Erro ao carregar balanços:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { key: 'companyName', title: 'Empresa', render: (v) => <b>{v}</b> },
    { key: 'ordersCount', title: 'Pedidos', render: (v) => Number(v) || 0 },
    { key: 'gross', title: 'Bruto', render: (v) => currency(v) },
    { key: 'subtotal', title: 'Subtotal', render: (v) => currency(v) },
    { key: 'deliveryFees', title: 'Taxas Entrega', render: (v) => currency(v) },
    { key: 'discounts', title: 'Descontos', render: (v) => currency(v) },
    { key: 'paid', title: 'Recebido', render: (v) => currency(v) },
  ];

  const summary = [
    { label: 'Pedidos', value: totals?.ordersCount ?? 0 },
    { label: 'Bruto', value: currency(totals?.gross) },
    { label: 'Subtotal', value: currency(totals?.subtotal) },
    { label: 'Taxas Entrega', value: currency(totals?.deliveryFees) },
    { label: 'Descontos', value: currency(totals?.discounts) },
    { label: 'Recebido', value: currency(totals?.paid) },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {summary.map((s) => (
          <div key={s.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.9rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem' }}>Balanço por Empresa</h4>
        <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Nenhuma empresa com pedidos entregues" />
      </div>
    </div>
  );
};

/* ---------------- Generic CRUD (simple entities) ---------------- */
const useSimpleCrud = (listFn, createFn, updateFn, deleteFn, emptyForm, mapForm) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await listFn({ page: 1, limit: 100 });
      setItems(extractList(res));
    } catch (e) {
      console.error('Erro ao carregar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => { setSelected(null); setFormData(emptyForm()); setModalOpen(true); };
  const handleEdit = (item) => { setSelected(item); setFormData(mapForm(item)); setModalOpen(true); };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (selected) await updateFn(selected._id, payload);
      else await createFn(payload);
      load();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (item) => {
    if (!window.confirm('Excluir este registro?')) return;
    try { await deleteFn(item._id); load(); } catch (e) { alert('Erro ao excluir: ' + (e.response?.data?.error || e.message)); }
  };

  return { items, loading, modalOpen, selected, formData, saving, handleCreate, handleEdit, handleChange, handleSave, handleDelete, setModalOpen };
};

const SimpleModal = ({ title, children, formData, handleChange, handleSave, saving, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
      </div>
      <form onSubmit={handleSave}>
        {children}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Input = ({ label, name, value, onChange, ...props }) => (
  <div className="form-group">
    <label>{label}</label>
    <input type="text" name={name} value={value ?? ''} onChange={onChange} {...props} />
  </div>
);

const Checkbox = ({ label, name, value, onChange }) => (
  <div className="form-group">
    <label>
      <input type="checkbox" name={name} checked={!!value} onChange={onChange} /> {label}
    </label>
  </div>
);

/* ---------------- Cost Centers ---------------- */
const CostCentersTab = () => {
  const emptyForm = () => ({ name: '', code: '', description: '', active: true });
  const mapForm = (i) => ({ name: i.name || '', code: i.code || '', description: i.description || '', active: i.active !== false });
  const crud = useSimpleCrud(
    financeService.listCostCenters, financeService.createCostCenter, financeService.updateCostCenter, financeService.deleteCostCenter, emptyForm, mapForm
  );

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'code', title: 'Código', render: (v) => v || '-' },
    { key: 'description', title: 'Descrição', render: (v) => v || '-' },
    { key: 'active', title: 'Status', render: (v) => <span className={v ? 'badge badge-success' : 'badge'}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Centros de Custo</h4>
        <button className="btn btn-primary" onClick={crud.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={crud.items} columns={columns} onEdit={crud.handleEdit} onDelete={crud.handleDelete} loading={crud.loading} emptyMessage="Nenhum centro de custo" />
      {crud.modalOpen && (
        <SimpleModal title={crud.selected ? 'Editar' : 'Novo'} {...crud}>
          <Input label="Nome *" name="name" value={crud.formData.name} onChange={crud.handleChange} required placeholder="Ex: Operacional" />
          <Input label="Código" name="code" value={crud.formData.code} onChange={crud.handleChange} placeholder="Ex: OP-001" />
          <Input label="Descrição" name="description" value={crud.formData.description} onChange={crud.handleChange} />
          <Checkbox label="Ativo" name="active" value={crud.formData.active} onChange={crud.handleChange} />
        </SimpleModal>
      )}
    </div>
  );
};

/* ---------------- Type Payments ---------------- */
const TypePaymentsTab = () => {
  const emptyForm = () => ({ name: '', code: '', description: '', active: true });
  const mapForm = (i) => ({ name: i.name || '', code: i.code || '', description: i.description || '', active: i.active !== false });
  const crud = useSimpleCrud(
    financeService.listTypePayments, financeService.createTypePayment, financeService.updateTypePayment, financeService.deleteTypePayment, emptyForm, mapForm
  );

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'code', title: 'Código', render: (v) => v || '-' },
    { key: 'description', title: 'Descrição', render: (v) => v || '-' },
    { key: 'active', title: 'Status', render: (v) => <span className={v ? 'badge badge-success' : 'badge'}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tipos de Pagamento</h4>
        <button className="btn btn-primary" onClick={crud.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={crud.items} columns={columns} onEdit={crud.handleEdit} onDelete={crud.handleDelete} loading={crud.loading} emptyMessage="Nenhum tipo de pagamento" />
      {crud.modalOpen && (
        <SimpleModal title={crud.selected ? 'Editar' : 'Novo'} {...crud}>
          <Input label="Nome *" name="name" value={crud.formData.name} onChange={crud.handleChange} required placeholder="Ex: PIX" />
          <Input label="Código *" name="code" value={crud.formData.code} onChange={crud.handleChange} required placeholder="Ex: PIX" />
          <Input label="Descrição" name="description" value={crud.formData.description} onChange={crud.handleChange} />
          <Checkbox label="Ativo" name="active" value={crud.formData.active} onChange={crud.handleChange} />
        </SimpleModal>
      )}
    </div>
  );
};

/* ---------------- Banks ---------------- */
const BanksTab = () => {
  const emptyForm = () => ({ name: '', code: '', active: true });
  const mapForm = (i) => ({ name: i.name || '', code: i.code || '', active: i.active !== false });
  const crud = useSimpleCrud(
    financeService.listBanks, financeService.createBank, financeService.updateBank, financeService.deleteBank, emptyForm, mapForm
  );

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'code', title: 'Código', render: (v) => v || '-' },
    { key: 'active', title: 'Status', render: (v) => <span className={v ? 'badge badge-success' : 'badge'}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Bancos</h4>
        <button className="btn btn-primary" onClick={crud.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={crud.items} columns={columns} onEdit={crud.handleEdit} onDelete={crud.handleDelete} loading={crud.loading} emptyMessage="Nenhum banco" />
      {crud.modalOpen && (
        <SimpleModal title={crud.selected ? 'Editar' : 'Novo'} {...crud}>
          <Input label="Nome *" name="name" value={crud.formData.name} onChange={crud.handleChange} required placeholder="Ex: Banco do Brasil" />
          <Input label="Código *" name="code" value={crud.formData.code} onChange={crud.handleChange} required placeholder="Ex: 001" />
          <Checkbox label="Ativo" name="active" value={crud.formData.active} onChange={crud.handleChange} />
        </SimpleModal>
      )}
    </div>
  );
};

/* ---------------- Agencies ---------------- */
const AgenciesTab = () => {
  const [banks, setBanks] = useState([]);
  const emptyForm = () => ({ name: '', code: '', bank: '', active: true });
  const mapForm = (i) => ({ name: i.name || '', code: i.code || '', bank: i.bank?._id || i.bank || '', active: i.active !== false });

  const listFn = async (params) => { const r = await financeService.listAgencies(params); return r; };
  const base = useSimpleCrud(
    listFn, financeService.createAgency, financeService.updateAgency, financeService.deleteAgency, emptyForm, mapForm
  );

  useEffect(() => {
    financeService.listBanks({ page: 1, limit: 100 }).then((res) => setBanks(extractList(res))).catch(() => {});
  }, []);

  const columns = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'code', title: 'Código', render: (v) => v || '-' },
    { key: 'bank', title: 'Banco', render: (v) => (v && typeof v === 'object' ? v.name : v) || '-' },
    { key: 'active', title: 'Status', render: (v) => <span className={v ? 'badge badge-success' : 'badge'}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Agências</h4>
        <button className="btn btn-primary" onClick={base.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={base.items} columns={columns} onEdit={base.handleEdit} onDelete={base.handleDelete} loading={base.loading} emptyMessage="Nenhuma agência" />
      {base.modalOpen && (
        <SimpleModal title={base.selected ? 'Editar' : 'Nova'} {...base}>
          <Input label="Nome *" name="name" value={base.formData.name} onChange={base.handleChange} required placeholder="Ex: Centro" />
          <Input label="Código *" name="code" value={base.formData.code} onChange={base.handleChange} required placeholder="Ex: 0001" />
          <div className="form-group">
            <label>Banco *</label>
            <select name="bank" value={base.formData.bank} onChange={base.handleChange} required>
              <option value="">Selecione</option>
              {banks.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <Checkbox label="Ativo" name="active" value={base.formData.active} onChange={base.handleChange} />
        </SimpleModal>
      )}
    </div>
  );
};

/* ---------------- Digital Accounts ---------------- */
const DigitalAccountsTab = () => {
  const [agencies, setAgencies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const emptyForm = () => ({ agency: '', accountNumber: '', digit: '', holderName: '', holderDocument: '', company: '', active: true });
  const mapForm = (i) => ({
    agency: i.agency?._id || i.agency || '', accountNumber: i.accountNumber || '', digit: i.digit || '',
    holderName: i.holderName || '', holderDocument: i.holderDocument || '', company: i.company?._id || i.company || '', active: i.active !== false,
  });
  const crud = useSimpleCrud(
    financeService.listDigitalAccounts, financeService.createDigitalAccount, financeService.updateDigitalAccount, financeService.deleteDigitalAccount, emptyForm, mapForm
  );

  useEffect(() => {
    financeService.listAgencies({ page: 1, limit: 100 }).then((res) => setAgencies(extractList(res))).catch(() => {});
    companyService.getCompanies().then((res) => setCompanies(extractList(res))).catch(() => {});
  }, []);

  const columns = [
    { key: 'accountNumber', title: 'Conta', render: (v, i) => <b>{v}{i.digit ? '-' + i.digit : ''}</b> },
    { key: 'holderName', title: 'Titular', render: (v) => v || '-' },
    { key: 'holderDocument', title: 'Documento', render: (v) => v || '-' },
    { key: 'agency', title: 'Agência', render: (v) => (v && typeof v === 'object' ? v.name : v) || '-' },
    { key: 'active', title: 'Status', render: (v) => <span className={v ? 'badge badge-success' : 'badge'}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Contas Digitais</h4>
        <button className="btn btn-primary" onClick={crud.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={crud.items} columns={columns} loading={crud.loading} emptyMessage="Nenhuma conta digital" />
      {crud.modalOpen && (
        <SimpleModal title={crud.selected ? 'Editar' : 'Nova'} {...crud}>
          <div className="form-group">
            <label>Agência *</label>
            <select name="agency" value={crud.formData.agency} onChange={crud.handleChange} required>
              <option value="">Selecione</option>
              {agencies.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <Input label="Número da Conta *" name="accountNumber" value={crud.formData.accountNumber} onChange={crud.handleChange} required placeholder="Ex: 1234567" />
          <Input label="Dígito" name="digit" value={crud.formData.digit} onChange={crud.handleChange} placeholder="Ex: 8" />
          <Input label="Titular *" name="holderName" value={crud.formData.holderName} onChange={crud.handleChange} required />
          <Input label="Documento do Titular" name="holderDocument" value={crud.formData.holderDocument} onChange={crud.handleChange} />
          <div className="form-group">
            <label>Empresa</label>
            <select name="company" value={crud.formData.company} onChange={crud.handleChange}>
              <option value="">Nenhuma</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name || c.companyName}</option>)}
            </select>
          </div>
          <Checkbox label="Ativo" name="active" value={crud.formData.active} onChange={crud.handleChange} />
        </SimpleModal>
      )}
    </div>
  );
};

/* ---------------- Chargebacks ---------------- */
const ChargebacksTab = () => {
  const emptyForm = () => ({ order: '', payment: '', company: '', amount: '', reason: '', status: 'pending' });
  const mapForm = (i) => ({
    order: i.order?._id || i.order || '', payment: i.payment?._id || i.payment || '',
    company: i.company?._id || i.company || '', amount: i.amount ?? '', reason: i.reason || '', status: i.status || 'pending',
  });
  const crud = useSimpleCrud(
    financeService.listChargebacks, financeService.createChargeback, financeService.updateChargeback, financeService.deleteChargeback, emptyForm, mapForm
  );

  const statusLabel = {
    pending: 'Pendente', approved: 'Aprovado', denied: 'Negado', reversed: 'Estornado',
  };

  const columns = [
    { key: 'amount', title: 'Valor', render: (v) => currency(v) },
    { key: 'reason', title: 'Motivo', render: (v) => v || '-' },
    { key: 'company', title: 'Empresa', render: (v) => (v && typeof v === 'object' ? v.name : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => {
      const color = v === 'approved' ? '#10b981' : v === 'denied' ? '#ef4444' : v === 'reversed' ? '#f59e0b' : '#6b7280';
      return <span style={{ fontWeight: 700, color }}>{statusLabel[v] || v}</span>;
    } },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Chargebacks</h4>
        <button className="btn btn-primary" onClick={crud.handleCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={crud.items} columns={columns} onEdit={crud.handleEdit} onDelete={crud.handleDelete} loading={crud.loading} emptyMessage="Nenhum chargeback" />
      {crud.modalOpen && (
        <SimpleModal title={crud.selected ? 'Editar' : 'Novo'} {...crud}>
          <Input label="Order ID *" name="order" value={crud.formData.order} onChange={crud.handleChange} required placeholder="Id do pedido" />
          <Input label="Payment ID *" name="payment" value={crud.formData.payment} onChange={crud.handleChange} required placeholder="Id do pagamento" />
          <Input label="Empresa ID *" name="company" value={crud.formData.company} onChange={crud.handleChange} required placeholder="Id da empresa" />
          <div className="form-group">
            <label>Valor *</label>
            <input type="number" name="amount" value={crud.formData.amount} onChange={crud.handleChange} required step="0.01" pattern="[0-9]*" />
          </div>
          <Input label="Motivo" name="reason" value={crud.formData.reason} onChange={crud.handleChange} />
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={crud.formData.status} onChange={crud.handleChange}>
              {['pending', 'approved', 'denied', 'reversed'].map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </div>
        </SimpleModal>
      )}
    </div>
  );
};

export default Finance;
