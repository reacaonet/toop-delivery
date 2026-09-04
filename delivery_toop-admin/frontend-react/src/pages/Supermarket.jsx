import React, { useState, useEffect } from 'react';
import { Store, Plus, X, FileText, RefreshCw, ScanBarcode } from 'lucide-react';
import { supermarketService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.response)) return res.response;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const Supermarket = () => {
  const [tab, setTab] = useState('tabloid');
  const tabs = [
    { key: 'tabloid', label: 'Tabloid', icon: FileText },
    { key: 'ecbr', label: 'ECBR Image Bank', icon: ScanBarcode },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Store size={20} style={{ marginRight: '0.5rem' }} />Supermercado</h3>
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
          {tab === 'tabloid' && <TabloidTab />}
          {tab === 'ecbr' && <EcbrTab />}
        </div>
      </div>
    </div>
  );
};

const TabloidTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: true, groupCompany: false, images: '' });
  const [saving, setSaving] = useState(false);

  const load = () => supermarketService.listTabloids().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description, status: form.status, groupCompany: form.groupCompany,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await supermarketService.createTabloid(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir tabloid "${it.name}"?`)) return;
    try { await supermarketService.deleteTabloid(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'description', title: 'Descrição', render: (v) => (v && String(v).length > 50 ? String(v).slice(0, 50) + '…' : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'groupCompany', title: 'Grupo', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
    { key: '_id', title: '', render: (_, it) => <button className="btn btn-danger btn-sm" onClick={() => remove(it)}>Excluir</button> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tabloid</h4>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '', status: true, groupCompany: false, images: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum tabloid" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Novo Tabloid</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label>Descrição *</label><input type="text" name="description" value={form.description} onChange={change} required /></div>
              <div className="form-group"><label>Imagens (URLs separadas por vírgula)</label><input type="text" name="images" value={form.images} onChange={change} /></div>
              <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
              <div className="form-group"><label><input type="checkbox" name="groupCompany" checked={form.groupCompany} onChange={change} /> Grupo de empresa</label></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EcbrTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', barcode: '', keywords: '', description: '', departments: '', weight: '', copyright: false, status: true, audited: false, images: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await supermarketService.ecbrList({ page: 1, limit: 50, barcode: barcode || undefined, name: name || undefined });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const genCode = async () => {
    try { const res = await supermarketService.ecbrGenerateCode(); setForm((p) => ({ ...p, barcode: (res && (res.sequence || res)) })); } catch (e) { console.error(e); }
  };

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const images = form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const payload = {
        name: form.name, barcode: form.barcode, description: form.description,
        keywords: form.keywords ? form.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
        departments: form.departments ? form.departments.split(',').map((s) => s.trim()).filter(Boolean) : [],
        weight: form.weight || undefined, copyright: form.copyright, status: form.status, audited: form.audited,
        file: images.length ? (images.length === 1 ? { url: images[0] } : images.map((u) => ({ url: u }))) : undefined,
      };
      if (selected) { delete payload.file; await supermarketService.ecbrUpdate(selected._id, payload); }
      else {
        if (!images.length) { alert('Informe ao menos uma imagem (URL)'); setSaving(false); return; }
        await supermarketService.ecbrCreate(payload);
      }
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const cols = [
    { key: 'barcode', title: 'Código', render: (v) => <b>{v}</b> },
    { key: 'name', title: 'Nome', render: (v) => v || '-' },
    { key: 'copyright', title: 'Copyright', render: (v) => v ? 'Sim' : 'Não' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>ECBR Image Bank</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" placeholder="Código..." value={barcode} onChange={(e) => setBarcode(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '140px' }} />
          <input type="text" placeholder="Nome..." value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '160px' }} />
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} /> Buscar</button>
          <button className="btn btn-primary" onClick={() => { setSelected(null); genCode(); setForm({ name: '', barcode: '', keywords: '', description: '', departments: '', weight: '', copyright: false, status: true, audited: false, images: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name || '', barcode: it.barcode || '', keywords: (it.keywords || []).join(', '), description: it.description || '', departments: (it.departments || []).map((d) => (d && d._id ? d._id : d)).join(', '), weight: it.weight || '', copyright: !!it.copyright, status: it.status !== false, audited: !!it.audited, images: (it.images || []).join(', ') }); setOpen(true); }} loading={loading} emptyMessage="Nenhum registro ECBR" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar ECBR' : 'Novo ECBR'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-row">
                <div className="form-group"><label>Código de barras *</label><input type="text" name="barcode" value={form.barcode} onChange={change} required /></div>
                <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              </div>
              <div className="form-group"><label>Descrição *</label><input type="text" name="description" value={form.description} onChange={change} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Keywords * (vírgula)</label><input type="text" name="keywords" value={form.keywords} onChange={change} required /></div>
                <div className="form-group"><label>Departments * (ids vírgula)</label><input type="text" name="departments" value={form.departments} onChange={change} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Peso</label><input type="text" name="weight" value={form.weight} onChange={change} /></div>
                <div className="form-group"><label>Imagens (URLs vírgula)</label><input type="text" name="images" value={form.images} onChange={change} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label><input type="checkbox" name="copyright" checked={form.copyright} onChange={change} /> Copyright</label></div>
                <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Status</label></div>
                <div className="form-group"><label><input type="checkbox" name="audited" checked={form.audited} onChange={change} /> Audited</label></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supermarket;
