// /stock
import React, { useState, useEffect } from 'react';
import { Package, Boxes, ArrowDownUp, Plus, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { stockService, companyService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const currentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?._id || u?.id || '';
  } catch { return ''; }
};

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '-');
const fmtDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');
const fmtMoney = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

const badge = (v, color) => (
  <span style={{ fontWeight: 700, color }}>{v}</span>
);

const CrudModal = ({ title, children, saving, onClose, onSave }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
      </div>
      <form onSubmit={onSave}>{children}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
        </div>
      </form>
    </div>
  </div>
);

const UNITS = ['kg', 'g', 'un', 'L', 'ml', 'cx', 'pct'];
const BATCH_STATUS = ['active', 'expired', 'consumed'];

const Stock = () => {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('');
  const [tab, setTab] = useState('itens');

  useEffect(() => {
    companyService.getCompanies().then((res) => {
      const list = extractList(res); setCompanies(list);
      if (list.length && !company) setCompany(list[0]?._id || '');
    }).catch(console.error);
  }, []);

  const tabs = [
    { key: 'itens', label: 'Itens', icon: Package },
    { key: 'lotes', label: 'Lotes', icon: Boxes },
    { key: 'movimentacoes', label: 'Movimentações', icon: ArrowDownUp },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Package size={20} style={{ marginRight: '0.5rem' }} />Estoque</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Empresa</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '220px' }}>
              {!company && <option value="">Selecione...</option>}
              {companies.map((c) => <option key={c._id} value={c._id}>{c.legalName || c.socialName || c.name || c._id}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => {
            const Icon = t.icon; const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', cursor: 'pointer',
                borderRadius: '8px', border: active ? '1px solid #10b981' : '1px solid transparent',
                background: active ? '#ecfdf5' : 'transparent', color: active ? '#047857' : '#4b5563',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
              }}><Icon size={16} />{t.label}</button>
            );
          })}
        </div>
        <div style={{ padding: '1rem' }}>
          {!company ? <p style={{ color: '#6b7280' }}>Selecione uma empresa para carregar o estoque.</p> : (
            <>
              {tab === 'itens' && <ItemsTab company={company} />}
              {tab === 'lotes' && <BatchesTab company={company} />}
              {tab === 'movimentacoes' && <MovementsTab company={company} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ItemsTab = ({ company }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', unit: 'un', minimumStock: 0, category: '', description: '', active: true });

  const load = (q = search) => {
    setLoading(true);
    return stockService.listItems(company, { search: q || undefined })
      .then((res) => setItems(extractList(res)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(''); /* eslint-disable-next-line */ }, [company]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        company,
        unit: form.unit,
        minimumStock: Number(form.minimumStock || 0),
        category: form.category || undefined,
        description: form.description || undefined,
        active: form.active,
      };
      if (selected) await stockService.updateItem(selected._id, payload);
      else await stockService.createItem(payload);
      await load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir item "${it.name}"?`)) return;
    try { await stockService.removeItem(it._id); await load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const openNew = () => { setSelected(null); setForm({ name: '', unit: 'un', minimumStock: 0, category: '', description: '', active: true }); setOpen(true); };
  const openEdit = (it) => { setSelected(it); setForm({ name: it.name || '', unit: it.unit || 'un', minimumStock: it.minimumStock ?? 0, category: it.category || '', description: it.description || '', active: it.active !== false }); setOpen(true); };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'category', title: 'Categoria', render: (v) => v || '-' },
    { key: 'unit', title: 'Unidade', render: (v) => v || '-' },
    { key: 'minimumStock', title: 'Estoque mín.', render: (v) => v ?? 0 },
    { key: 'active', title: 'Status', render: (v) => badge(v ? 'Ativo' : 'Inativo', v ? '#10b981' : '#6b7280') },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Itens</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar item..." style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '200px' }} />
          <button className="btn btn-secondary" onClick={() => load(search)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Buscar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum item" />
      {open && <CrudModal title={selected ? 'Editar Item' : 'Novo Item'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Unidade *</label>
            <select name="unit" value={form.unit} onChange={change} required>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Estoque mín.</label><input type="number" step="any" min="0" name="minimumStock" value={form.minimumStock} onChange={change} /></div>
        </div>
        <div className="form-group"><label>Categoria</label><input type="text" name="category" value={form.category} onChange={change} /></div>
        <div className="form-group"><label>Descrição</label><input type="text" name="description" value={form.description} onChange={change} /></div>
        <div className="form-group"><label><input type="checkbox" name="active" checked={form.active} onChange={change} /> Ativo</label></div>
      </CrudModal>}
    </div>
  );
};

const BatchesTab = ({ company }) => {
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [form, setForm] = useState({ stockItem: '', branch: '', quantity: '', initialQuantity: '', unitCost: '', batchNumber: '', supplier: '', expiryDate: '', entryDate: '', status: 'active' });

  useEffect(() => {
    stockService.listBranches(company).then((res) => setBranches(extractList(res))).catch(() => {});
    stockService.listItems(company).then((res) => setItems(extractList(res))).catch(() => {});
  }, [company]);

  const load = () => {
    setLoading(true);
    const p = branch
      ? stockService.listBatchesByBranch(branch)
      : stockService.listBatchesByCompany(company);
    return p.then((res) => setBatches(extractList(res))).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [company, branch]);

  const loadAlerts = () => {
    setLoadingAlerts(true);
    return stockService.listBatchAlerts(company)
      .then((res) => { setAlerts(extractList(res)); setAlertsOpen(true); })
      .catch((err) => alert('Erro: ' + (err.response?.data?.error || err.message)))
      .finally(() => setLoadingAlerts(false));
  };

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const qty = Number(form.quantity);
      const payload = {
        stockItem: form.stockItem,
        branch: form.branch,
        quantity: qty,
        initialQuantity: form.initialQuantity ? Number(form.initialQuantity) : qty,
        unitCost: Number(form.unitCost || 0),
        batchNumber: form.batchNumber,
        supplier: form.supplier || undefined,
        expiryDate: form.expiryDate || undefined,
        entryDate: form.entryDate || new Date().toISOString(),
        status: form.status,
      };
      if (selected) await stockService.updateBatch(selected._id, payload);
      else await stockService.createBatch(payload);
      await load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const openNew = () => { setSelected(null); setForm({ stockItem: '', branch: branch || '', quantity: '', initialQuantity: '', unitCost: '', batchNumber: '', supplier: '', expiryDate: '', entryDate: '', status: 'active' }); setOpen(true); };
  const openEdit = (it) => { setSelected(it); setForm({ stockItem: it.stockItem?._id || it.stockItem || '', branch: it.branch?._id || it.branch || '', quantity: it.quantity, initialQuantity: it.initialQuantity, unitCost: it.unitCost, batchNumber: it.batchNumber || '', supplier: it.supplier || '', expiryDate: fmtDateInput(it.expiryDate), entryDate: fmtDateInput(it.entryDate), status: it.status || 'active' }); setOpen(true); };

  const statusColor = (v) => (v === 'active' ? '#10b981' : v === 'expired' ? '#ef4444' : '#6b7280');

  const cols = [
    { key: 'stockItem', title: 'Item', render: (v) => (v && v.name) || (v?._id) || '-' },
    { key: 'branch', title: 'Filial', render: (v) => (v && v.name) || (v?._id) || '-' },
    { key: 'quantity', title: 'Qtd.', render: (v) => v ?? 0 },
    { key: 'unitCost', title: 'Custo unit.', render: (v) => fmtMoney(v) },
    { key: 'batchNumber', title: 'Lote', render: (v) => v || '-' },
    { key: 'expiryDate', title: 'Validade', render: (v) => fmtDate(v) },
    { key: 'entryDate', title: 'Entrada', render: (v) => fmtDate(v) },
    { key: 'status', title: 'Status', render: (v) => badge(v || '-', statusColor(v)) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Lotes</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '180px' }}>
            <option value="">Todas as filiais</option>
            {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-secondary" onClick={loadAlerts} disabled={loadingAlerts}><AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />Alertas de estoque</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={batches} columns={cols} onEdit={openEdit} loading={loading} emptyMessage="Nenhum lote" />
      {open && <CrudModal title={selected ? 'Editar Lote' : 'Novo Lote'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}><label>Item *</label>
            <select name="stockItem" value={form.stockItem} onChange={change} required>
              <option value="">Selecione...</option>
              {items.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Filial *</label>
            <select name="branch" value={form.branch} onChange={change} required>
              <option value="">Selecione...</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Qtd. atual *</label><input type="number" step="any" min="0" name="quantity" value={form.quantity} onChange={change} required /></div>
          <div className="form-group"><label>Qtd. inicial *</label><input type="number" step="any" min="0" name="initialQuantity" value={form.initialQuantity} onChange={change} required /></div>
          <div className="form-group"><label>Custo unit. *</label><input type="number" step="0.01" min="0" name="unitCost" value={form.unitCost} onChange={change} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Cód. lote (batchNumber) *</label><input type="text" name="batchNumber" value={form.batchNumber} onChange={change} required /></div>
          <div className="form-group"><label>Fornecedor</label><input type="text" name="supplier" value={form.supplier} onChange={change} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Validade</label><input type="date" name="expiryDate" value={form.expiryDate} onChange={change} /></div>
          <div className="form-group"><label>Data entrada</label><input type="date" name="entryDate" value={form.entryDate} onChange={change} /></div>
          <div className="form-group"><label>Status</label>
            <select name="status" value={form.status} onChange={change}>
              {BATCH_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </CrudModal>}
      {alertsOpen && (
        <div className="modal-overlay" onClick={() => setAlertsOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />Alertas de estoque baixo</h3><button className="close-btn" onClick={() => setAlertsOpen(false)}><X size={24} /></button></div>
            <div style={{ padding: '0.25rem 0 0' }}>
              <DataTable data={alerts} columns={[
                { key: 'stockItem', title: 'Item', render: (v) => (v && v.name) || '-' },
                { key: 'branch', title: 'Filial', render: (v) => (v && v.name) || '-' },
                { key: 'currentQuantity', title: 'Qtd. atual', render: (v) => v ?? 0 },
                { key: 'minimumStock', title: 'Estoque mín.', render: (v) => v ?? 0 },
              ]} loading={loadingAlerts} emptyMessage="Nenhum alerta" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MovementsTab = ({ company }) => {
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState('');
  const [type, setType] = useState('');
  const [stockItemId, setStockItemId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ stockItem: '', branch: '', quantity: '', unitCost: '', batchNumber: '', supplier: '', expiryDate: '', orderId: '', reason: '', notes: '' });

  useEffect(() => {
    stockService.listBranches(company).then((res) => setBranches(extractList(res))).catch(() => {});
    stockService.listItems(company).then((res) => setItems(extractList(res))).catch(() => {});
  }, [company]);

  const load = () => {
    setLoading(true);
    const params = {};
    if (type) params.type = type;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const p = branch
      ? stockService.listMovementsByBranch(branch, { ...params, stockItemId: stockItemId || undefined })
      : stockService.listMovementsByCompany(company, params);
    return p.then((res) => {
      let list = extractList(res);
      if (!branch && stockItemId) list = list.filter((m) => (m.stockItem?._id || m.stockItem) === stockItemId);
      setMovements(list);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [company, branch, type, stockItemId, startDate, endDate]);

  const loadSummary = () => {
    if (!branch) { setSummary([]); return; }
    stockService.getSummaryByBranch(branch).then((res) => setSummary(extractList(res))).catch(console.error);
  };
  useEffect(() => { loadSummary(); /* eslint-disable-next-line */ }, [branch]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openEntry = () => { setForm({ stockItem: '', branch: branch || '', quantity: '', unitCost: '', batchNumber: '', supplier: '', expiryDate: '', orderId: '', reason: 'Entrada de estoque', notes: '' }); setEntryOpen(true); };
  const openExit = () => { setForm({ stockItem: '', branch: branch || '', quantity: '', unitCost: '', batchNumber: '', supplier: '', expiryDate: '', orderId: '', reason: 'Saída de estoque', notes: '' }); setExitOpen(true); };

  const saveEntry = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        stockItem: form.stockItem,
        branch: form.branch,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost || 0),
        batchNumber: form.batchNumber,
        supplier: form.supplier || undefined,
        expiryDate: form.expiryDate || undefined,
        user: currentUserId(),
        reason: form.reason || 'Entrada de estoque',
        notes: form.notes || undefined,
      };
      await stockService.registerEntry(payload);
      await Promise.all([load(), loadSummary()]); setEntryOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const saveExit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        stockItem: form.stockItem,
        branch: form.branch,
        quantity: Number(form.quantity),
        user: currentUserId(),
        orderId: form.orderId || undefined,
        reason: form.reason || 'Saída de estoque',
        notes: form.notes || undefined,
      };
      await stockService.registerExit(payload);
      await Promise.all([load(), loadSummary()]); setExitOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const typeColors = { entry: '#10b981', exit: '#ef4444', transfer: '#f59e0b', adjustment: '#3b82f6' };

  const cols = [
    { key: 'type', title: 'Tipo', render: (v) => badge(v || '-', typeColors[v] || '#6b7280') },
    { key: 'stockItem', title: 'Item', render: (v) => (v && v.name) || '-' },
    { key: 'branch', title: 'Filial', render: (v) => (v && v.name) || '-' },
    { key: 'quantity', title: 'Qtd.', render: (v) => v ?? 0 },
    { key: 'unitCost', title: 'Custo unit.', render: (v) => (v != null ? fmtMoney(v) : '-') },
    { key: 'totalCost', title: 'Custo total', render: (v) => (v != null ? fmtMoney(v) : '-') },
    { key: 'reason', title: 'Motivo', render: (v) => v || '-' },
    { key: 'movementDate', title: 'Data', render: (v) => fmtDate(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Movimentações</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '160px' }}>
            <option value="">Todas as filiais</option>
            {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            <option value="">Todos tipos</option>
            <option value="entry">Entrada</option>
            <option value="exit">Saída</option>
          </select>
          <select value={stockItemId} onChange={(e) => setStockItemId(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '160px' }}>
            <option value="">Todos itens</option>
            {items.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openEntry}><Plus size={16} style={{ marginRight: '0.5rem' }} />Entrada</button>
          <button className="btn btn-primary" onClick={openExit}><Plus size={16} style={{ marginRight: '0.5rem' }} />Saída</button>
        </div>
      </div>

      {branch && summary.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {summary.map((s) => (
            <div key={s.stockItem?._id || s.stockItem} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.6rem 0.9rem', minWidth: '180px', background: s.belowMinimum ? '#fef2f2' : '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.stockItem?.name || '-'}</div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Qtd: <b>{s.totalQuantity}</b> · {fmtMoney(s.totalValue)}</div>
              <div style={{ fontSize: '0.75rem', color: s.belowMinimum ? '#ef4444' : '#10b981', fontWeight: 600 }}>{s.belowMinimum ? 'Abaixo do mínimo' : 'Ok'} · {s.batchesCount} lote(s)</div>
            </div>
          ))}
        </div>
      )}

      <DataTable data={movements} columns={cols} loading={loading} emptyMessage="Nenhuma movimentação" />

      {entryOpen && <CrudModal title="Registrar Entrada" saving={saving} onClose={() => setEntryOpen(false)} onSave={saveEntry}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}><label>Item *</label>
            <select name="stockItem" value={form.stockItem} onChange={change} required>
              <option value="">Selecione...</option>
              {items.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Filial *</label>
            <select name="branch" value={form.branch} onChange={change} required>
              <option value="">Selecione...</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Qtd. *</label><input type="number" step="any" min="0" name="quantity" value={form.quantity} onChange={change} required /></div>
          <div className="form-group"><label>Custo unit. *</label><input type="number" step="0.01" min="0" name="unitCost" value={form.unitCost} onChange={change} required /></div>
          <div className="form-group"><label>Cód. lote *</label><input type="text" name="batchNumber" value={form.batchNumber} onChange={change} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Fornecedor</label><input type="text" name="supplier" value={form.supplier} onChange={change} /></div>
          <div className="form-group"><label>Validade</label><input type="date" name="expiryDate" value={form.expiryDate} onChange={change} /></div>
        </div>
        <div className="form-group"><label>Motivo</label><input type="text" name="reason" value={form.reason} onChange={change} /></div>
        <div className="form-group"><label>Observações</label><input type="text" name="notes" value={form.notes} onChange={change} /></div>
      </CrudModal>}

      {exitOpen && <CrudModal title="Registrar Saída" saving={saving} onClose={() => setExitOpen(false)} onSave={saveExit}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}><label>Item *</label>
            <select name="stockItem" value={form.stockItem} onChange={change} required>
              <option value="">Selecione...</option>
              {items.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Filial *</label>
            <select name="branch" value={form.branch} onChange={change} required>
              <option value="">Selecione...</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Qtd. *</label><input type="number" step="any" min="0" name="quantity" value={form.quantity} onChange={change} required /></div>
          <div className="form-group"><label>Pedido (orderId)</label><input type="text" name="orderId" value={form.orderId} onChange={change} /></div>
        </div>
        <div className="form-group"><label>Motivo</label><input type="text" name="reason" value={form.reason} onChange={change} /></div>
        <div className="form-group"><label>Observações</label><input type="text" name="notes" value={form.notes} onChange={change} /></div>
      </CrudModal>}
    </div>
  );
};

export default Stock;