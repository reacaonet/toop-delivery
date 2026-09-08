import React, { useState, useEffect, useCallback } from 'react';
import { Star, UserRound, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityEvaluationService, driverService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const PAGE_SIZE = 20;

const StarDisplay = ({ stars }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} fill={i <= Math.round(stars) ? '#f59e0b' : 'none'} stroke={i <= Math.round(stars) ? '#f59e0b' : '#d1d5db'} />
    ))}
    <span style={{ marginLeft: '4px', fontSize: '0.85rem', color: '#4b5563' }}>{stars?.toFixed(1)}</span>
  </span>
);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Pagination = ({ page, total, pageSize, loading, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
      <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
      <button className="btn btn-secondary" disabled={page <= 0 || loading} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
      <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
      <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
    </div>
  );
};

const PassengerToDriverTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback((pg = 0) => {
    setLoading(true);
    mobilityEvaluationService.list({ pageIn: pg + 1, pageOut: PAGE_SIZE })
      .then((res) => { setItems(extractList(res)); setTotal(Number(res?.total) || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  const cols = [
    {
      key: 'passenger', title: 'Passageiro',
      render: (v) => v?.person?.name || v?.person?.[0]?.name || '-',
    },
    {
      key: 'driver', title: 'Motorista',
      render: (v) => v?.name || v?.person?.name || '-',
    },
    { key: 'stars', title: 'Estrelas', render: (v) => <StarDisplay stars={v} /> },
    { key: 'description', title: 'Comentário', render: (v) => <span style={{ maxWidth: '250px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v || '-'}</span> },
    { key: 'createdAt', title: 'Data', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma avaliação passageiro→motorista" />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} loading={loading} onPageChange={(p) => { setPage(p); load(p); }} />
    </div>
  );
};

const DriverToPassengerTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState('');

  useEffect(() => {
    driverService.getDrivers().then((res) => setDrivers(extractList(res))).catch(() => {});
  }, []);

  const load = useCallback((pg = 0) => {
    setLoading(true);
    const params = { pageIn: pg + 1, pageOut: PAGE_SIZE, limit: PAGE_SIZE };
    if (selectedDriver) params.driver = selectedDriver;
    if (selectedPassenger) params.passenger = selectedPassenger;
    mobilityEvaluationService.paginateByDriver(params)
      .then((res) => { setItems(extractList(res)); setTotal(Number(res?.total) || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDriver, selectedPassenger]);

  useEffect(() => { load(0); }, [load]);

  const cols = [
    {
      key: 'driver', title: 'Motorista',
      render: (v) => v?.name || v?.person?.name || '-',
    },
    {
      key: 'passenger', title: 'Passageiro',
      render: (v) => v?.person?.name || v?.person?.[0]?.name || '-',
    },
    { key: 'stars', title: 'Estrelas', render: (v) => <StarDisplay stars={v} /> },
    { key: 'description', title: 'Comentário', render: (v) => <span style={{ maxWidth: '250px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v || '-'}</span> },
    { key: 'createdAt', title: 'Data', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
          <label>Motorista</label>
          <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
            <option value="">Todos</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>{d.name || d.person?.name || d._id}</option>
            ))}
          </select>
        </div>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma avaliação motorista→passageiro" />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} loading={loading} onPageChange={(p) => { setPage(p); load(p); }} />
    </div>
  );
};

const AverageRatingTab = () => {
  const [ratedId, setRatedId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAverage = () => {
    if (!ratedId.trim()) return;
    setLoading(true);
    setResult(null);
    mobilityEvaluationService.getAverageRating(ratedId.trim())
      .then((res) => setResult(res))
      .catch((err) => { console.error(err); setResult(null); })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div className="form-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>ID do Avaliado (Motorista ou Passageiro) *</label>
          <input type="text" value={ratedId} onChange={(e) => setRatedId(e.target.value)} placeholder="Cole o ObjectId..." />
        </div>
        <button className="btn btn-primary" onClick={fetchAverage} disabled={loading || !ratedId.trim()}>
          {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Star size={16} style={{ marginRight: '0.5rem' }} />Consultar</>}
        </button>
      </div>
      {result && (
        <div className="card" style={{ padding: '1.5rem', maxWidth: '400px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Resultado (últimos 6 meses)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><b>Avaliações:</b> {result.count}</div>
            <div><b>Soma Total:</b> {result.totalRating}</div>
            <div><b>Média:</b> <StarDisplay stars={result.mediaRating} /></div>
          </div>
        </div>
      )}
      {result === null && !loading && ratedId.trim() && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Nenhum resultado encontrado para este ID.</p>
      )}
    </div>
  );
};

const MobilityEvaluations = () => {
  const [tab, setTab] = useState('passengerToDriver');

  const tabs = [
    { key: 'passengerToDriver', label: 'Passageiro → Motorista', icon: Star },
    { key: 'driverToPassenger', label: 'Motorista → Passageiro', icon: UserRound },
    { key: 'average', label: 'Média por Avaliado', icon: Star },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Star size={20} style={{ marginRight: '0.5rem' }} />Avaliações de Mobilidade</h3>
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
          {tab === 'passengerToDriver' && <PassengerToDriverTab />}
          {tab === 'driverToPassenger' && <DriverToPassengerTab />}
          {tab === 'average' && <AverageRatingTab />}
        </div>
      </div>
    </div>
  );
};

export default MobilityEvaluations;
