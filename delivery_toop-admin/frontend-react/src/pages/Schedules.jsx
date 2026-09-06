import React, { useState, useEffect } from 'react';
import { Clock, Building2, CalendarPlus, Plus, RefreshCw } from 'lucide-react';
import { scheduleService, companyService } from '../services/api';
import DataTable from '../components/DataTable';

const WEEK_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
};
const TYPE_LABELS = {
  DELIVERY: 'Entrega',
  WITHDRAWAL: 'Retirada',
  BOTH: 'Ambos',
};

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.response)) return res.response;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const toHM = (n) => {
  if (n == null) return '-';
  const s = String(n).padStart(4, '0');
  return s.slice(0, 2) + ':' + s.slice(2);
};

const toNumber = (time) => {
  if (!time) return 0;
  return parseInt(String(time).replace(':', ''), 10) || 0;
};

const Schedules = () => {
  const [tab, setTab] = useState('byCompany');
  const tabs = [
    { key: 'byCompany', label: 'Por Empresa', icon: Building2 },
    { key: 'register', label: 'Cadastrar', icon: CalendarPlus },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <h3><Clock size={20} style={{ marginRight: '0.5rem' }} />Horários</h3>
        <button className="btn btn-primary" onClick={() => setTab('register')}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
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
        {tab === 'byCompany' && <ByCompanyTab />}
        {tab === 'register' && <RegisterTab />}
      </div>
    </div>
  );
};

const ByCompanyTab = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => scheduleService.all().then((res) => setGroups(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (it) => {
    if (!window.confirm('Excluir este horário?')) return;
    try { await scheduleService.remove(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!groups.length) return <div className="loading"><p>Nenhum horário cadastrado</p></div>;

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Horários por Empresa</h4>
        <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} /> Atualizar</button>
      </div>
      {groups.map((g) => <GroupCard key={g._id} group={g} onRemove={remove} />)}
    </div>
  );
};

const GroupCard = ({ group, onRemove }) => {
  const [open, setOpen] = useState(true);
  const name = (group.company && group.company.name) || group.company || '-';
  const days = Object.keys(group.hours || {});
  const rows = [];
  days.forEach((day) => {
    (group.hours[day] || []).forEach((slot) => rows.push({ day, _id: slot.id, start: slot.start, end: slot.end }));
  });
  const cols = [
    { key: 'day', title: 'Dia', render: (v) => DAY_LABELS[v] || v },
    { key: 'start', title: 'Início', render: toHM },
    { key: 'end', title: 'Fim', render: toHM },
    { key: '_id', title: '', render: (_, it) => <button className="btn btn-danger btn-sm" onClick={() => onRemove(it)}>Excluir</button> },
  ];
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <strong>{name}</strong>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{group.count ?? rows.length} horário(s)</span>
      </div>
      {open && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <DataTable data={rows} columns={cols} emptyMessage="Sem horários" />
        </div>
      )}
    </div>
  );
};

const RegisterTab = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ company: '', dayWeek: 'SUNDAY', startHour: '', endHour: '', type: 'BOTH' });
  const [saving, setSaving] = useState(false);

  const loadCompanies = () => companyService.getCompanies().then(
    (res) => setCompanies(extractList(res).filter((c) => c && c._id))
  ).catch(console.error);
  useEffect(() => { loadCompanies(); }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!form.company) { alert('Selecione uma empresa.'); setSaving(false); return; }
      const startHour = toNumber(form.startHour);
      const endHour = toNumber(form.endHour);
      if (!startHour || !endHour) { alert('Informe os horários de início e fim.'); setSaving(false); return; }
      if (endHour <= startHour) { alert('O horário de fim deve ser maior que o de início.'); setSaving(false); return; }
      await scheduleService.create(form.company, { dayWeek: form.dayWeek, startHour, endHour, type: form.type });
      alert('Horário salvo com sucesso.');
      setForm((p) => ({ ...p, dayWeek: 'SUNDAY', startHour: '', endHour: '', type: 'BOTH' }));
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Cadastrar Horário</h4>
      </div>
      <form onSubmit={save}>
        <div className="form-group"><label>Empresa *</label>
          <select name="company" value={form.company} onChange={change} required>
            <option value="">Selecione...</option>
            {companies.map((c) => <option key={c._id} value={c._id}>{c.name || c.razaoSocial || c._id}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Dia *</label>
            <select name="dayWeek" value={form.dayWeek} onChange={change}>
              {WEEK_DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Tipo *</label>
            <select name="type" value={form.type} onChange={change}>
              {Object.keys(TYPE_LABELS).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Início *</label><input type="time" name="startHour" value={form.startHour} onChange={change} required /></div>
          <div className="form-group"><label>Fim *</label><input type="time" name="endHour" value={form.endHour} onChange={change} required /></div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
};

export default Schedules;