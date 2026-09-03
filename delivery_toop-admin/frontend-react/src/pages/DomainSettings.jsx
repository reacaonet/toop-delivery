import React, { useState, useEffect } from 'react';
import { Globe, Plus, X, MapPin, Users, Smartphone, Landmark, Clock, Settings2 } from 'lucide-react';
import { domainService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const DomainSettings = () => {
  const [tab, setTab] = useState('states');

  const tabs = [
    { key: 'states', label: 'Estados', icon: MapPin },
    { key: 'cities', label: 'Cidades', icon: Globe },
    { key: 'typesUsers', label: 'Tipos de Usuário', icon: Users },
    { key: 'appVersions', label: 'Versões App', icon: Smartphone },
    { key: 'banks', label: 'Bancos', icon: Landmark },
    { key: 'timezones', label: 'Fusos', icon: Clock },
    { key: 'globals', label: 'Config Global', icon: Settings2 },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Globe size={20} style={{ marginRight: '0.5rem' }} />Configurações de Domínio</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
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
          {tab === 'states' && <StatesTab />}
          {tab === 'cities' && <CitiesTab />}
          {tab === 'typesUsers' && <TypesUsersTab />}
          {tab === 'appVersions' && <AppVersionsTab />}
          {tab === 'banks' && <BanksTab />}
          {tab === 'timezones' && <TimezonesTab />}
          {tab === 'globals' && <GlobalsTab />}
        </div>
      </div>
    </div>
  );
};

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

const StatesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', uf: '', country: 'BRASIL' });
  const [saving, setSaving] = useState(false);

  const load = () => domainService.listStates().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { if (selected) await domainService.updateState(selected._id, form); else await domainService.createState(form); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };
  const remove = async (it) => { if (!window.confirm(`Excluir estado "${it.name}"?`)) return; try { await domainService.deleteState(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'uf', title: 'UF', render: (v) => v || '-' },
    { key: 'country', title: 'País', render: (v) => v || '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Estados</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', uf: '', country: 'BRASIL' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name, uf: it.uf, country: it.country || 'BRASIL' }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum estado" />
      {open && <CrudModal title={selected ? 'Editar' : 'Novo'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-group"><label>UF *</label><input type="text" name="uf" value={form.uf} onChange={change} required /></div>
        <div className="form-group"><label>País</label><input type="text" name="country" value={form.country} onChange={change} /></div>
      </CrudModal>}
    </div>
  );
};

const CitiesTab = () => {
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', state: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await domainService.listCities({ pageIn: 0, pageOut: 100 }); setItems(extractList(res)); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); domainService.listStates().then((res) => setStates(extractList(res))).catch(() => {}); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault(); setSaving(true); try {
      const payload = { name: form.name, state: form.state, latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined };
      if (selected) await domainService.updateCity(selected._id, payload); else await domainService.createCity(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };
  const remove = async (it) => { if (!window.confirm(`Excluir cidade "${it.name}"?`)) return; try { await domainService.deleteCity(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'state', title: 'Estado', render: (v) => (v && typeof v === 'object' ? (v.uf || v.name) : v) || '-' },
    { key: 'latitude', title: 'Lat', render: (v) => v ?? '-' },
    { key: 'longitude', title: 'Lng', render: (v) => v ?? '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Cidades</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', state: '', latitude: '', longitude: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name, state: it.state?._id || it.state || '', latitude: it.latitude ?? '', longitude: it.longitude ?? '' }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhuma cidade" />
      {open && <CrudModal title={selected ? 'Editar' : 'Nova'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-group"><label>Estado *</label><select name="state" value={form.state} onChange={change} required><option value="">Selecione</option>{states.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.uf})</option>)}</select></div>
        <div className="form-group"><label>Latitude</label><input type="number" name="latitude" value={form.latitude} onChange={change} step="any" /></div>
        <div className="form-group"><label>Longitude</label><input type="number" name="longitude" value={form.longitude} onChange={change} step="any" /></div>
      </CrudModal>}
    </div>
  );
};

const TypesUsersTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', status: false });
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const res = await domainService.listTypesUsers({ pageIn: 0, pageOut: 100 }); setItems(extractList(res)); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { const payload = { name: form.name, status: form.status }; if (selected) await domainService.updateTypeUser(selected._id, payload); else await domainService.createTypeUser(payload); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };
  const remove = async (it) => { if (!window.confirm(`Excluir tipo "${it.name}"?`)) return; try { await domainService.deleteTypeUser(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tipos de Usuários</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', status: false }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name, status: !!it.status }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum tipo de usuário" />
      {open && <CrudModal title={selected ? 'Editar' : 'Novo'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
      </CrudModal>}
    </div>
  );
};

const AppVersionsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', version: '', platform: 'android', status: true });
  const [saving, setSaving] = useState(false);

  const load = () => domainService.listAppVersions().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { await domainService.createAppVersion(form); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'version', title: 'Versão', render: (v) => v || '-' },
    { key: 'platform', title: 'Plataforma', render: (v) => <span className={v === 'ios' ? 'badge' : 'badge badge-success'} style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Versões do App</h4>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', version: '', platform: 'android', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma versão" />
      {open && <CrudModal title="Nova versão" saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-group"><label>Versão *</label><input type="text" name="version" value={form.version} onChange={change} required /></div>
        <div className="form-group"><label>Plataforma *</label><select name="platform" value={form.platform} onChange={change}>{['android', 'ios'].map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
      </CrudModal>}
    </div>
  );
};

const BanksTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { domainService.listBrazilianBanks({}).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false)); }, []);

  const cols = [
    { key: 'compe', title: 'Compe', render: (v) => v || '-' },
    { key: 'long_name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'short_name', title: 'Sigla', render: (v) => v || '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}><h4>Bancos Brasileiros</h4></div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum banco" />
    </div>
  );
};

const TimezonesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { domainService.listTimezones().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false)); }, []);

  const cols = [
    { key: 'offset', title: 'Offset', render: (v) => `UTC${v >= 0 ? '+' : ''}${v}` },
    { key: 'zone', title: 'Zona', render: (v) => <b>{v}</b> },
    { key: 'name', title: 'Nome', render: (v) => v || '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}><h4>Fusos Horários</h4></div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum fuso" />
    </div>
  );
};

const GlobalsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { domainService.getGlobalSettings().then((d) => setData(d)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return <div className="loading"><p>Sem configurações globais</p></div>;

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}><h4>Configurações Globais</h4></div>
      <form onSubmit={(e) => { e.preventDefault(); setSaving(true); alert('Não há endpoint PUT para Config Global (apenas GET). Valor atual salvo no backend.'); setSaving(false); }}>
        <div className="form-group"><label>Service Charge (%)</label><input type="number" name="serviceCharge" value={data.serviceCharge ?? 0} disabled style={{ opacity: 0.7 }} step="any" /></div>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Leitura apenas — o valor de serviceCharge é gerenciado pelo backend.</p>
      </form>
    </div>
  );
};

export default DomainSettings;
