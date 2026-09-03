import React, { useState, useEffect } from 'react';
import { Car, Plus, X, FileText, Clock, HelpCircle } from 'lucide-react';
import { mobilityService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Mobility = () => {
  const [tab, setTab] = useState('documentTypes');

  const tabs = [
    { key: 'documentTypes', label: 'Tipos de Documento', icon: FileText },
    { key: 'peakHours', label: 'Horários de Pico', icon: Clock },
    { key: 'supportSubjects', label: 'Assuntos de Suporte', icon: HelpCircle },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Mobility</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
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
          {tab === 'documentTypes' && <DocumentTypesTab />}
          {tab === 'peakHours' && <PeakHoursTab />}
          {tab === 'supportSubjects' && <SupportSubjectsTab />}
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

const DocumentTypesTab = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', mandatory: false, extensions: '' }); const [saving, setSaving] = useState(false);
  const load = () => mobilityService.listDocumentTypes({}).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { const payload = { name: form.name, mandatory: form.mandatory }; if (selected) await mobilityService.updateDocumentType(selected._id, payload); else await mobilityService.createDocumentType(payload); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };
  const remove = async (it) => { if (!window.confirm('Excluir tipo de documento?')) return; try { await mobilityService.deleteDocumentType(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };
  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'mandatory', title: 'Obrigatório', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tipos de Documento</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', mandatory: false }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name, mandatory: !!it.mandatory }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum tipo de documento" />
      {open && <CrudModal title={selected ? 'Editar' : 'Novo'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
        <div className="form-group"><label><input type="checkbox" name="mandatory" checked={form.mandatory} onChange={change} /> Obrigatório</label></div>
      </CrudModal>}
    </div>
  );
};

const PeakHoursTab = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ hourStart: '', hourEnd: '', dayId: '', factor: 1 }); const [saving, setSaving] = useState(false);
  const load = () => mobilityService.listPeakHours({}).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { const payload = { hourStart: form.hourStart, hourEnd: form.hourEnd, dayId: form.dayId, factor: form.factor ? Number(form.factor) : 1 }; if (selected) await mobilityService.updatePeakHour(selected._id, payload); else await mobilityService.createPeakHour(payload); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };
  const remove = async (it) => { if (!window.confirm('Excluir horário de pico?')) return; try { await mobilityService.deletePeakHour(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };
  const cols = [
    { key: 'hourStart', title: 'Início', render: (v) => v || '-' },
    { key: 'hourEnd', title: 'Fim', render: (v) => v || '-' },
    { key: 'factor', title: 'Fator', render: (v) => v ?? 0 },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Horários de Pico</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ hourStart: '', hourEnd: '', dayId: '', factor: 1 }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ hourStart: it.hourStart || '', hourEnd: it.hourEnd || '', dayId: it.dayId || '', factor: it.factor ?? 1 }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum horário de pico" />
      {open && <CrudModal title={selected ? 'Editar' : 'Novo'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Início *</label><input type="time" name="hourStart" value={form.hourStart} onChange={change} required /></div>
        <div className="form-group"><label>Fim *</label><input type="time" name="hourEnd" value={form.hourEnd} onChange={change} required /></div>
        <div className="form-group"><label>Fator *</label><input type="number" name="factor" value={form.factor} onChange={change} step="any" /></div>
      </CrudModal>}
    </div>
  );
};

const SupportSubjectsTab = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ subject: '', status: true }); const [saving, setSaving] = useState(false);
  const load = () => mobilityService.listSupportSubjects({}).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); try { const payload = { subject: form.subject, status: form.status }; if (selected) await mobilityService.updateSupportSubject(selected._id, payload); else await mobilityService.createSupportSubject(payload); load(); setOpen(false); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); } };
  const remove = async (it) => { if (!window.confirm('Excluir assunto de suporte?')) return; try { await mobilityService.deleteSupportSubject(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };
  const cols = [
    { key: 'subject', title: 'Assunto', render: (v) => <b>{v}</b> },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Assuntos de Suporte</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ subject: '', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ subject: it.subject || '', status: it.status !== false }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum assunto de suporte" />
      {open && <CrudModal title={selected ? 'Editar' : 'Novo'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group"><label>Assunto *</label><input type="text" name="subject" value={form.subject} onChange={change} required /></div>
        <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
      </CrudModal>}
    </div>
  );
};

export default Mobility;
