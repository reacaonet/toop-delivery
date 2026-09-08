import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquareQuote, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { companyService, reviewService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtDate = (v) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return v; }
};

const StarRating = ({ value }) => (
  <span style={{ display: 'inline-flex', gap: '1px' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} fill={i <= (value || 0) ? '#f59e0b' : 'none'} stroke={i <= (value || 0) ? '#f59e0b' : '#d1d5db'} />
    ))}
    <span style={{ marginLeft: '0.35rem', fontSize: '0.8rem', color: '#4b5563' }}>{value ?? '-'}</span>
  </span>
);

const Reviews = () => {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await companyService.getCompanies();
        const arr = Array.isArray(res) ? res : [];
        setCompanies(arr);
      } catch (e) { console.error(e); } finally { setCompaniesLoading(false); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!companyId) { setList([]); setTotal(0); return; }
    setLoading(true);
    try {
      const res = await reviewService.listByCompany(companyId, { page, limit });
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      const tot = res?.total ?? (Array.isArray(res) ? res.length : 0);
      setList(data);
      setTotal(tot);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [companyId, page, limit]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [companyId, limit]);

  const cols = [
    { key: 'rating', title: 'Nota', render: (v) => <StarRating value={v} /> },
    { key: 'comment', title: 'Comentário', render: (v) => v || <span style={{ color: '#9ca3af' }}>-</span> },
    {
      key: 'customer', title: 'Cliente',
      render: (v) => (v && typeof v === 'object' ? v.name || v._id : v) || '-',
    },
    {
      key: 'type', title: 'Tipo',
      render: (v) => (
        <span className="badge" style={{ textTransform: 'capitalize' }}>
          {v === 'store' ? 'Loja' : v === 'deliveryman' ? 'Entregador' : v || '-'}
        </span>
      ),
    },
    {
      key: 'order', title: 'Pedido',
      render: (v) => (v && typeof v === 'object' ? v._id || String(v) : v) || '-',
    },
    { key: 'createdAt', title: 'Data', render: (v) => fmtDate(v) },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><MessageSquareQuote size={20} style={{ marginRight: '0.5rem' }} />Avaliações</h3>
        </div>
        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>Empresa</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={companiesLoading}
            style={{
              padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '0.85rem', minWidth: '260px',
            }}
          >
            <option value="">{companiesLoading ? 'Carregando...' : 'Selecione uma empresa'}</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>{c.name || c._id}</option>
            ))}
          </select>
        </div>
      </div>

      {companyId && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} /> Avaliações da empresa ({total})
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
              </select>
              <button className="btn btn-secondary" onClick={load} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
          <div style={{ padding: '0 1rem 1rem' }}>
            <DataTable data={list} columns={cols} loading={loading} emptyMessage="Nenhuma avaliação encontrada" />
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '0.3rem 0.5rem' }}>
                  <ChevronLeft size={16} />
                </button>
                <span>Página {page} de {totalPages} ({Number(total).toLocaleString('pt-BR')} registros)</span>
                <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '0.3rem 0.5rem' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
