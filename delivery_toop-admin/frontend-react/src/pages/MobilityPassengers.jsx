// /mobility/passengers
import React, { useState, useEffect } from 'react';
import { UserRound, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { passengerService, franchiseService, personService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') + ' ' + new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-');
const personName = (it) => (it?.person?.name) || (it?.person && typeof it.person === 'string' ? it.person : '-');
const personPhone = (it) => {
  const p = it?.person;
  if (!p || typeof p === 'string') return '-';
  return `${p.ddi || '+55'} ${p.phone || ''}`.trim() || '-';
};
const personEmail = (it) => (it?.person?.email) || '-';

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

const MobilityPassengers = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [franchises, setFranchises] = useState([]);
  const [persons, setPersons] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ person: '', franchise: '', status: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    franchiseService.listAll().then((res) => setFranchises(extractList(res))).catch(console.error);
    personService.paginator({ pageIn: 0, pageOut: 1000 }).then((res) => {
      const list = extractList(res);
      setPersons(list);
    }).catch(console.error);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await passengerService.paginator({ pageIn: page, pageOut: limit });
      const list = extractList(res);
      setItems(list);
      setTotal(Array.isArray(res) ? list.length : (res?.total ?? 0));
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };
  useEffect(() => { if (!searching) load(); }, [page, searching]);

  const doSearch = async () => {
    const term = search.trim();
    if (!term) { setSearching(false); setPage(0); load(); return; }
    setSearching(true); setLoading(true);
    try {
      const res = await passengerService.filter({ name: term });
      const list = extractList(res);
      setItems(list);
      setTotal(list.length);
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { person: form.person, franchise: form.franchise || undefined, status: form.status };
      if (selected) await passengerService.update(selected._id, payload);
      else await passengerService.create(payload);
      if (searching) doSearch(); else load();
      setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir passageiro de "${personName(it)}"?`)) return;
    try { await passengerService.remove(it._id); if (searching) doSearch(); else load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cols = [
    { key: 'person', title: 'Cliente', render: (v, it) => <b>{personName(it)}</b> },
    { key: 'phone', title: 'Telefone', render: (v, it) => personPhone(it) },
    { key: 'email', title: 'E-mail', render: (v, it) => personEmail(it) },
    { key: 'franchise', title: 'Franquia', render: (v) => (v?.name) || '-' },
    { key: 'stars', title: 'Estrelas', render: (v) => v ?? 0 },
    { key: 'referralCode', title: 'Indicação', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'createdAt', title: 'Criado', render: fmtDate },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><UserRound size={20} style={{ marginRight: '0.5rem' }} />Mobility Passageiros</h3>
      </div>
      <div style={{ padding: '1rem' }}>
        <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
          <h4>Passageiros cadastrados</h4>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ person: '', franchise: '', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
        <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" placeholder="Buscar cliente por nome/e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '260px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }} />
            <button className="btn btn-secondary" onClick={doSearch}>Buscar</button>
            {searching && <button className="btn btn-secondary" onClick={() => { setSearch(''); setSearching(false); setPage(0); load(); }}>Limpar</button>}
            <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} /></button>
          </div>
        </div>
        <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ person: it.person?._id || it.person || '', franchise: it.franchise?._id || it.franchise || '', status: it.status !== false }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum passageiro" />
        {!searching && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Página {page + 1} de {totalPages} · {total} passageiro(s)</span>
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
      {open && <CrudModal title={selected ? 'Editar Passageiro' : 'Novo Passageiro'} saving={saving} onClose={() => setOpen(false)} onSave={save}>
        <div className="form-group">
          <label>Cliente (Pessoa) *</label>
          <select name="person" value={form.person} onChange={change} required>
            <option value="">Selecione...</option>
            {persons.map((p) => <option key={p._id} value={p._id}>{p.name || p.email || p._id}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Franquia</label>
          <select name="franchise" value={form.franchise} onChange={change}>
            <option value="">Selecione...</option>
            {franchises.map((f) => <option key={f._id} value={f._id}>{f.name || f._id}</option>)}
          </select>
        </div>
        <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
      </CrudModal>}
    </div>
  );
};

export default MobilityPassengers;
