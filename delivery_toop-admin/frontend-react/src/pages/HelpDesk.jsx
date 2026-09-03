import React, { useState, useEffect } from 'react';
import { Headphones, Plus, X, MessageSquare, HelpCircle } from 'lucide-react';
import { helpdeskService, faqService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];
const DEPARTMENT = ['ADMINISTRATIVE', 'COMMERCIAL', 'MARKETING', 'FINANCIAL', 'SUPPORT', 'TI'];
const STATUS = ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'SOLVED'];

const statusColor = {
  NEW: '#3b82f6', IN_PROGRESS: '#f59e0b', ON_HOLD: '#6b7280', SOLVED: '#10b981',
};
const priorityLabel = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' };
const deptLabel = { ADMINISTRATIVE: 'Administrativo', COMMERCIAL: 'Comercial', MARKETING: 'Marketing', FINANCIAL: 'Financeiro', SUPPORT: 'Suporte', TI: 'TI' };
const ticketStatusLabel = { NEW: 'Novo', IN_PROGRESS: 'Em andamento', ON_HOLD: 'Aguardando', SOLVED: 'Resolvido' };

const HelpDesk = () => {
  const [tab, setTab] = useState('tickets');

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Headphones size={20} style={{ marginRight: '0.5rem' }} />HelpDesk</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {[{ key: 'tickets', label: 'Tickets', icon: MessageSquare }, { key: 'faq', label: 'FAQ', icon: HelpCircle }].map((t) => {
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
          {tab === 'tickets' && <TicketsTab />}
          {tab === 'faq' && <FaqTab />}
        </div>
      </div>
    </div>
  );
};

const TicketsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ tickedId: '', subject: '', description: '', priority: 'LOW', department: 'SUPPORT', status: 'NEW', name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [interaction, setInteraction] = useState('');

  const load = async () => {
    try {
      const res = await helpdeskService.listTickets({ page: 1, limit: 100 });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setSelected(null); setForm({ tickedId: '', subject: '', description: '', priority: 'LOW', department: 'SUPPORT', status: 'NEW', name: '', email: '' }); setModalOpen(true); };
  const openEdit = (it) => { setSelected(it); setForm({ tickedId: it.tickedId || '', subject: it.subject || '', description: it.description || '', priority: it.priority || 'LOW', department: it.department || 'SUPPORT', status: it.status || 'NEW', name: it.name || '', email: it.email || '' }); setModalOpen(true); };
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selected) await helpdeskService.updateTicket(selected._id, form);
      else await helpdeskService.createTicket(form);
      load(); setModalOpen(false);
    } catch (err) { alert('Erro ao salvar: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir ticket "${it.tickedId}"?`)) return;
    try { await helpdeskService.deleteTicket(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const openDetail = async (it) => {
    try {
      const d = await helpdeskService.getByProtocol(it.tickedId);
      setDetail(d); setInteraction('');
    } catch (err) { alert('Erro ao carregar: ' + (err.response?.data?.error || err.message)); }
  };

  const addInteraction = async (e) => {
    e.preventDefault();
    try {
      await helpdeskService.createInteraction(detail._id, { description: interaction, origin: 'company', author: 'admin' });
      const d = await helpdeskService.getByProtocol(detail.tickedId);
      setDetail(d); setInteraction('');
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const columns = [
    { key: 'tickedId', title: 'Protocolo', render: (v) => <b>{v}</b> },
    { key: 'subject', title: 'Assunto', render: (v) => v || '-' },
    { key: 'name', title: 'Solicitante', render: (v) => v || '-' },
    { key: 'priority', title: 'Prioridade', render: (v) => <span style={{ fontWeight: 700, color: v === 'HIGH' ? '#ef4444' : v === 'MEDIUM' ? '#f59e0b' : '#6b7280' }}>{priorityLabel[v] || v}</span> },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: statusColor[v] || '#000' }}>{ticketStatusLabel[v] || v}</span> },
    { key: 'createdAt', title: 'Criado', render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tickets de Suporte</h4>
        <div>
          <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => { setDetail(null); }}>Fechar detalhe</button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Ticket</button>
        </div>
      </div>

      <DataTable data={items} columns={columns} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum ticket" />
      <div style={{ marginTop: '0.75rem' }}>
        <button className="btn btn-secondary" disabled={!detail} onClick={() => setDetail(null)} style={{ display: 'none' }}></button>
      </div>

      {detail && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            <h4>Ticket {detail.tickedId} — {detail.subject}</h4>
          </div>
          <table className="table">
            <tbody>
              <tr><td style={{ fontWeight: 700, width: '140px' }}>Descrição</td><td>{detail.description}</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Solicitante</td><td>{detail.name} {detail.email ? `(${detail.email})` : ''}</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Prioridade</td><td>{priorityLabel[detail.priority] || detail.priority} / {ticketStatusLabel[detail.status] || detail.status}</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Empresa</td><td>{detail.company?.name || '-'}</td></tr>
            </tbody>
          </table>
          <h5 style={{ margin: '1rem 0 0.5rem' }}>Interações</h5>
          <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem' }}>
            {(detail.interactions || []).map((i) => (
              <div key={i._id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{i.origin} · {(i.author || '')} · {new Date(i.createdAt).toLocaleString('pt-BR')}</div>
                <div>{i.description}</div>
              </div>
            ))}
            {(detail.interactions || []).length === 0 && <p style={{ color: '#9ca3af' }}>Sem interações.</p>}
          </div>
          <form onSubmit={addInteraction} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input type="text" className="form-control" value={interaction} onChange={(e) => setInteraction(e.target.value)} placeholder="Nova interação..." required style={{ flex: 1, padding: '0.5rem' }} />
            <button className="btn btn-primary" type="submit">Enviar</button>
          </form>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Ticket' : 'Novo Ticket'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Protocolo (tickedId) *</label><input type="text" name="tickedId" value={form.tickedId} onChange={change} required placeholder="ex: TKT-001" /></div>
              <div className="form-group"><label>Assunto *</label><input type="text" name="subject" value={form.subject} onChange={change} required /></div>
              <div className="form-group"><label>Nome do solicitante</label><input type="text" name="name" value={form.name} onChange={change} /></div>
              <div className="form-group"><label>E-mail</label><input type="email" name="email" value={form.email} onChange={change} /></div>
              <div className="form-group"><label>Descrição</label><textarea name="description" value={form.description} onChange={change} rows={3} /></div>
              <div className="form-group"><label>Prioridade</label><select name="priority" value={form.priority} onChange={change}>{PRIORITY.map((p) => <option key={p} value={p}>{priorityLabel[p]}</option>)}</select></div>
              <div className="form-group"><label>Departamento</label><select name="department" value={form.department} onChange={change}>{DEPARTMENT.map((d) => <option key={d} value={d}>{deptLabel[d]}</option>)}</select></div>
              {selected && (
                <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={change}>{STATUS.map((s) => <option key={s} value={s}>{ticketStatusLabel[s]}</option>)}</select></div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FaqTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', caption: '', description: '', status: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await faqService.list({ page: 1, limit: 100 });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setSelected(null); setForm({ title: '', caption: '', description: '', status: true }); setModalOpen(true); };
  const openEdit = (it) => { setSelected(it); setForm({ title: it.title || '', caption: it.caption || '', description: it.description || '', status: it.status !== false }); setModalOpen(true); };
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selected) await faqService.update(selected._id, form);
      else await faqService.create(form);
      load(); setModalOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir FAQ "${it.title}"?`)) return;
    try { await faqService.remove(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const columns = [
    { key: 'title', title: 'Título', render: (v) => <b>{v}</b> },
    { key: 'caption', title: 'Legenda', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Perguntas Frequentes</h4>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova FAQ</button>
      </div>
      <DataTable data={items} columns={columns} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhuma FAQ" />

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar FAQ' : 'Nova FAQ'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Título *</label><input type="text" name="title" value={form.title} onChange={change} required /></div>
              <div className="form-group"><label>Legenda *</label><input type="text" name="caption" value={form.caption} onChange={change} required /></div>
              <div className="form-group"><label>Descrição *</label><textarea name="description" value={form.description} onChange={change} rows={5} required /></div>
              <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDesk;
