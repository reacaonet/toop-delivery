import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Search, RefreshCw, Star, X } from 'lucide-react';
import { shoppingPaymentMethodService, userService } from '../services/api';
import DataTable from '../components/DataTable';

const CARD_FLAGS = [
  'AMEX', 'DINERS', 'DISCOVER', 'ELO', 'MASTERCARD', 'MASTER', 'MAESTRO', 'VISA', 'OTHERS',
];

const CARD_FLAG_COLORS = {
  AMEX: '#1f2937', DINERS: '#374151', DISCOVER: '#f97316', ELO: '#7c3aed',
  MASTERCARD: '#dc2626', MASTER: '#dc2626', MAESTRO: '#0891b2', VISA: '#2563eb', OTHERS: '#6b7280',
};

const ensureArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.list)) return res.list;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

const maskCartNumber = (v) => {
  if (!v) return '-';
  const s = String(v).replace(/\s+/g, '');
  if (s.length < 4) return `****${s}`;
  return `****${s.slice(-4)}`;
};

const maskDocument = (v) => {
  if (!v) return '-';
  const s = String(v);
  if (s.length < 4) return '***';
  return `***...${s.slice(-2)}`;
};

const fmtValid = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${yyyy}`;
};

const ShoppingPaymentMethods = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    userService.getUsers()
      .then((res) => {
        const all = ensureArray(res);
        setCustomers(all.filter((u) => u && u.role === 'customer'));
      })
      .catch(console.error);
  }, []);

  const load = useCallback(async () => {
    if (!selectedCustomer) return;
    setListLoading(true);
    try {
      const res = await shoppingPaymentMethodService.list(selectedCustomer._id, {});
      setItems(ensureArray(res));
    } catch (e) { console.error(e); setItems([]); } finally { setListLoading(false); }
  }, [selectedCustomer]);

  useEffect(() => { load(); }, [load]);

  const selectCustomer = (u) => {
    setSelectedCustomer(u);
    setItems([]);
    setEditing(null);
  };

  const toggleMain = async (it) => {
    if (!it.isMain) {
      if (!window.confirm('Definir este cartão como principal?')) return;
    }
    try {
      await shoppingPaymentMethodService.update(it._id, { isMain: !it.isMain });
      load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const remove = async (it) => {
    if (!window.confirm('Excluir (soft-delete) este método de pagamento?')) return;
    try {
      await shoppingPaymentMethodService.remove(it._id);
      load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const startEdit = (it) => setEditing({ ...it, _name: it.nameOnCard || '', _flag: it.flag || '' });

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const flag = editing._flag || editing.flag;
    if (!CARD_FLAGS.includes(flag)) { alert('Bandeira inválida'); return; }
    const payload = { nameOnCard: editing._name };
    if (flag !== editing.flag) payload.flag = flag;
    try {
      await shoppingPaymentMethodService.update(editing._id, payload);
      setEditing(null);
      load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const filteredCustomers = customers.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const cols = [
    {
      key: 'flag',
      title: 'Bandeira',
      render: (v) => <span className="badge" style={{ background: CARD_FLAG_COLORS[v] || '#6b7280', color: '#fff', textTransform: 'capitalize' }}>{v || '-'}</span>,
    },
    {
      key: 'nameOnCard',
      title: 'Titular',
      render: (v, it) => (v ? <b>{v}</b> : it.nameOnCard || '-'),
    },
    {
      key: 'cartNumber',
      title: 'Cartão',
      render: (v, it) => maskCartNumber(v || it.cartNumber),
    },
    {
      key: 'valid',
      title: 'Validade',
      render: (v, it) => fmtValid(v || it.valid),
    },
    {
      key: 'gateway',
      title: 'Gateway',
      render: (v, it) => (v || it.gateway || '-'),
    },
    {
      key: 'document',
      title: 'Documento',
      render: (v, it) => maskDocument(v || it.document),
    },
    {
      key: 'isMain',
      title: 'Principal',
      render: (v, it) => (
        <button
          className="btn btn-secondary"
          onClick={() => toggleMain(it)}
          style={{ padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Star size={14} color={v ? '#f59e0b' : '#9ca3af'} fill={v ? '#f59e0b' : 'none'} />
          {v ? 'Principal' : 'Definir'}
        </button>
      ),
    },
    {
      key: 'isDeleted',
      title: 'Status',
      render: (v) => (
        <span className="badge" style={{ background: v ? '#ef4444' : '#10b981', color: '#fff' }}>
          {v ? 'Excluído' : 'Ativo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><CreditCard size={20} style={{ marginRight: '0.5rem' }} />Métodos de Pagamento (Shopping)</h3>
        </div>

        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Search size={16} style={{ color: '#6b7280' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nome ou e-mail..."
              style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxHeight: '10rem', overflowY: 'auto' }}>
            {filteredCustomers.map((u) => (
              <button
                key={u._id}
                onClick={() => selectCustomer(u)}
                style={{
                  padding: '0.4rem 0.7rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.8rem',
                  border: selectedCustomer && selectedCustomer._id === u._id ? '1px solid #10b981' : '1px solid #e5e7eb',
                  background: selectedCustomer && selectedCustomer._id === u._id ? '#ecfdf5' : '#fff',
                  color: selectedCustomer && selectedCustomer._id === u._id ? '#047857' : '#374151',
                  fontWeight: selectedCustomer && selectedCustomer._id === u._id ? 700 : 500,
                }}
              >
                {u.person?.name || u.name || u.email}{u.email ? ` (${u.email})` : ''}
              </button>
            ))}
            {filteredCustomers.length === 0 && (
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Nenhum cliente encontrado.</span>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {!selectedCustomer ? (
            <div className="loading"><p>Selecione um cliente para visualizar seus métodos de pagamento.</p></div>
          ) : (
            <div>
              <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
                <h4>
                  Métodos de {selectedCustomer.person?.name || selectedCustomer.name || selectedCustomer.email}
                </h4>
                <button className="btn btn-secondary" onClick={load} disabled={listLoading}>
                  <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar
                </button>
              </div>

              <DataTable data={items} columns={cols} onEdit={startEdit} onDelete={remove} loading={loading || listLoading} emptyMessage="Nenhum método de pagamento" />

              {editing && (
                <div className="modal-overlay" onClick={() => setEditing(null)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Editar método de pagamento</h3>
                      <button className="close-btn" onClick={() => setEditing(null)}><X size={24} /></button>
                    </div>
                    <form onSubmit={saveEdit}>
                      <div className="form-group">
                        <label>Titular no cartão *</label>
                        <input type="text" required value={editing._name} onChange={(e) => setEditing({ ...editing, _name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Bandeira</label>
                        <select value={editing._flag} onChange={(e) => setEditing({ ...editing, _flag: e.target.value })}>
                          {CARD_FLAGS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                        Sensíveis (CVV e token do cartão) não são exibidos nem editados por aqui.
                      </p>
                      <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPaymentMethods;
