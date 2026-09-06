import React, { useState, useEffect } from 'react';
import { Gift, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { indicationService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') + ' ' + new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-');
const fmtQtd = (n) => `${n}`;
const fmtMoney = (n) => (n != null ? 'R$ ' + Number(n).toFixed(2) : '-');

const Indications = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);

  const load = async () => {
    setLoading(true);
    try {
      const res = await indicationService.paginator({ page, limit });
      const list = Array.isArray(res) ? res : res?.list || [];
      setItems(list);
      setTotal(Array.isArray(res) ? list.length : (res?.total ?? 0));
    } catch (e) { console.error(e); setItems([]); setTotal(0); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cols = [
    { key: 'person', title: 'Indicado', render: (v) => (v && v.name) || '—' },
    { key: 'personReceive', title: 'Recebedor', render: (v) => <b>{(v && v.name) || '—'}</b> },
    { key: 'referralCode', title: 'Código', render: (v) => v || '-' },
    { key: 'total', title: 'Valor', render: fmtMoney },
    { key: 'rescued', title: 'Resgatado', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
    { key: 'active', title: 'Ativo', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
    { key: 'createdAt', title: 'Data', render: fmtDate },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><Gift size={20} style={{ marginRight: '0.5rem' }} />Indicações</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.85rem' }}>Página {page + 1} de {totalPages} · {fmtQtd(total)} indicação(ões)</span>
          <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma indicação" />
    </div>
  );
};

export default Indications;