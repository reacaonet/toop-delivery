import React, { useState, useEffect } from 'react';
import { Users, Copy, RefreshCw, Eye, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { personService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') + ' ' + new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-');
const fmtPhone = (it) => `${it.ddi || '+55'} ${it.phone || ''}`.trim() || '-';

const Persons = () => {
  const [tab, setTab] = useState('list');
  const tabs = [
    { key: 'list', label: 'Pessoas', icon: Users },
    { key: 'dups', label: 'Duplicados', icon: Copy },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Users size={20} style={{ marginRight: '0.5rem' }} />Pessoas</h3>
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
          {tab === 'list' && <ListTab />}
          {tab === 'dups' && <DupsTab />}
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ it, onClose, onDelete }) => {
  const row = (k, v) => v != null && v !== '' ? <tr><td style={{ fontWeight: 600 }}>{k}</td><td>{v}</td></tr> : null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Pessoa</h3><button className="close-btn" onClick={onClose}><X size={24} /></button></div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <table className="table" style={{ fontSize: '0.85rem' }}>
            <tbody>
              {row('Nome', it.name)}
              {row('Telefone', fmtPhone(it))}
              {row('Celular', it.cellphone)}
              {row('E-mail', it.email)}
              {row('CPF', it.cpf)}
              {row('Código de indicação', it.referralCode)}
              {row('Cidade', it.city && (it.city.name || it.city._id))}
              {row('Status', it.status ? 'Ativo' : 'Inativo')}
              {row('Sexo', it.genre)}
              {row('Nascimento', it.birthdate ? new Date(it.birthdate).toLocaleDateString('pt-BR') : null)}
              {row('Fuso', it.timeZone)}
              {row('Dispositivos', (it.devices || []).length)}
              {row('Criado em', fmtDate(it.createdAt))}
              {row('Atualizado em', fmtDate(it.updatedAt))}
            </tbody>
          </table>
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            {onDelete && <button className="btn btn-danger" onClick={() => onDelete(it)}><Trash2 size={16} style={{ marginRight: '0.5rem' }} />Excluir (soft)</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await personService.paginator({ pageIn: page, pageOut: limit, name: search || undefined });
      const list = Array.isArray(res) ? res : res?.list || [];
      setItems(list);
      setTotal(Array.isArray(res) ? list.length : (res?.total ?? 0));
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page]);

  const remove = async (it) => {
    if (!window.confirm(`Excluir (soft) "${it.name || it._id}"?`)) return;
    try { await personService.remove(it._id); load(); setDetail(null); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'phone', title: 'Telefone', render: (v, it) => fmtPhone(it) },
    { key: 'email', title: 'E-mail', render: (v) => v || '-' },
    { key: 'referralCode', title: 'Código de indicação', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'createdAt', title: 'Criado', render: fmtDate },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Pessoas cadastradas</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '220px' }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); load(); } }} />
          <button className="btn btn-secondary" onClick={() => { setPage(0); load(); }}>Buscar</button>
          <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.85rem' }}>Página {page + 1} de {totalPages} · {total} pessoa(s)</span>
          <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} /></button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onView={(it) => setDetail(it)} loading={loading} emptyMessage="Nenhuma pessoa" />
      {detail && <DetailModal it={detail} onClose={() => setDetail(null)} onDelete={remove} />}
    </div>
  );
};

const DupsTab = () => {
  const [field, setField] = useState('phone');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await personService.registerDuplicates('person', field);
      const arr = Array.isArray(res) ? res : [];
      setItems(arr.filter((x) => x && x._id));
    } catch (e) { console.error(e); setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [field]);

  const cols = [
    { key: '_id', title: field === 'phone' ? 'Telefone' : 'E-mail', render: (v) => <b>{v}</b> },
    { key: field === 'phone' ? 'nmPhone' : 'nmEmail', title: 'Registros', render: (v) => v },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Duplicados por campo (agrega $group do legado)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={field} onChange={(e) => setField(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            <option value="phone">Telefone</option>
            <option value="email">E-mail</option>
          </select>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage={`Nenhum duplicado de ${field}`} />
    </div>
  );
};

export default Persons;