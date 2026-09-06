import React, { useState, useEffect } from 'react';
import { Users, UserSquare, RefreshCw, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { customerService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
const fmtPhone = (it) => `${it.ddi || '+55'} ${it.phone || ''}`.trim() || '-';

const Customers = () => {
  const [tab, setTab] = useState('list');
  const tabs = [
    { key: 'list', label: 'Clientes', icon: Users },
    { key: 'search', label: 'Busca', icon: UserSquare },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Users size={20} style={{ marginRight: '0.5rem' }} />Clientes</h3>
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
          {tab === 'search' && <SearchTab />}
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ id, onClose }) => {
  const [it, setIt] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    customerService.list(id).then(setIt).catch((e) => setError(e.response?.data?.error || e.message));
  }, [id]);
  if (error) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Erro</h3><button className="close-btn" onClick={onClose}><X size={24} /></button></div>
        <div className="modal-body"><p>{error}</p></div>
      </div>
    </div>
  );
  if (!it) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="loading"><div className="spinner" /></div>
      </div>
    </div>
  );
  const person = it.person || {};
  const row = (k, v) => v != null && v !== '' ? <tr><td style={{ fontWeight: 600 }}>{k}</td><td>{v}</td></tr> : null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Cliente</h3><button className="close-btn" onClick={onClose}><X size={24} /></button></div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <table className="table" style={{ fontSize: '0.85rem' }}>
            <tbody>
              {row('Nome', person.name)}
              {row('Telefone', fmtPhone(it))}
              {row('E-mail', person.email || it.email)}
              {row('CPF', person.cpf)}
              {row('SKU', it.sku)}
              {row('Versão do app', it.appVersion)}
              {row('Dispositivo', it.device)}
              {row('Token de instância', it.instanceIdToken)}
              {row('Termos não aceitos', it.termsNotAccepted ? 'Sim' : 'Não')}
              {row('Restaurantes favoritos', (it.favoriteRestaurants || []).length)}
              {row('Supermercados favoritos', (it.favoriteSupermarkets || []).length)}
              {row('Avaliação', it.rating && it.rating.stars != null ? `${it.rating.stars} estrelas${it.rating.comment ? ' - ' + it.rating.comment : ''}` : null)}
              {row('Removido em', it.deletedAt ? fmtDate(it.deletedAt) : null)}
              {row('Criado em', fmtDate(it.createdAt))}
            </tbody>
          </table>
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
  const [limit] = useState(15);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await customerService.paginator({ page, limit });
      const list = Array.isArray(res) ? res : res?.list || [];
      setItems(list);
      setTotal(Array.isArray(res) ? list.length : (res?.total ?? 0));
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page]);

  const remove = async (it) => {
    if (!window.confirm(`Excluir cliente de "${(it.person && it.person.name) || it.email || it._id}"?`)) return;
    try { await customerService.remove(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cols = [
    { key: 'person', title: 'Nome', render: (v) => <b>{v && v.name}</b> },
    { key: 'phone', title: 'Telefone', render: (v, it) => fmtPhone(it) },
    { key: 'person', title: 'E-mail', render: (v, it) => (v && v.email) || it.email || '-' },
    { key: 'appVersion', title: 'App', render: (v) => v || '-' },
    { key: 'createdAt', title: 'Criado', render: fmtDate },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Cadastro de clientes</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.85rem' }}>Página {page + 1} de {totalPages} · {total} cliente(s)</span>
          <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onView={(it) => setDetail(it._id)} onDelete={remove} loading={loading} emptyMessage="Nenhum cliente" />
      {detail && <DetailModal id={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

const SearchTab = () => {
  const [name, setName] = useState('');
  const [byName, setByName] = useState([]);
  const [nameLoading, setNameLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [byContact, setByContact] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const searchName = async () => {
    if (!name || name.length < 2) { alert('Informe ao menos 2 caracteres para buscar por nome.'); return; }
    setNameLoading(true);
    try { setByName(await customerService.searchPersonCustomer({ name })); } catch (e) { console.error(e); setByName([]); } finally { setNameLoading(false); }
  };

  const searchContact = async () => {
    if (!contact) { alert('Informe um e-mail ou telefone.'); return; }
    setContactLoading(true);
    try { setByContact(await customerService.searchCustomer({ email: contact, phone: contact })); } catch (e) { console.error(e); setByContact([]); } finally { setContactLoading(false); }
  };

  const nameCols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'email', title: 'E-mail', render: (v) => v || '-' },
    { key: 'phone', title: 'Telefone', render: (v) => v || '-' },
    { key: 'customer', title: 'Cliente', render: (v) => v && v._id ? 'Cadastrado' : 'Sem cadastro' },
  ];

  const contactCols = [
    { key: 'email', title: 'E-mail', render: (v) => v || '-' },
    { key: 'phone', title: 'Telefone', render: (v) => v || '-' },
    { key: 'instanceIdToken', title: 'Token instância', render: (v) => (v ? String(v).slice(0, 18) + '…' : '-') },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Buscar cliente</h4>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input type="text" placeholder="Nome da pessoa (mín. 2 caracteres)..." value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '280px' }}
          onKeyDown={(e) => { if (e.key === 'Enter') searchName(); }} />
        <button className="btn btn-secondary" onClick={searchName}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Buscar por nome</button>
      </div>
      <DataTable data={byName} columns={nameCols} onView={(it) => it.customer && it.customer._id && setDetail(it.customer._id)} loading={nameLoading} emptyMessage="Nenhuma pessoa encontrada" />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '1rem 0' }}>
        <input type="text" placeholder="E-mail ou telefone do cliente..." value={contact} onChange={(e) => setContact(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '280px' }}
          onKeyDown={(e) => { if (e.key === 'Enter') searchContact(); }} />
        <button className="btn btn-secondary" onClick={searchContact}><UserSquare size={16} style={{ marginRight: '0.5rem' }} />Buscar por contato</button>
      </div>
      <DataTable data={byContact} columns={contactCols} loading={contactLoading} emptyMessage="Nenhum cliente encontrado" />
      {detail && <DetailModal id={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default Customers;