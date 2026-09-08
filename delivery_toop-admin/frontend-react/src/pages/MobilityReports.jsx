import React, { useState, useEffect, useCallback } from 'react';
import { Car, FileText, RefreshCw, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityReportService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

const MobilityReports = () => {
  const [tab, setTab] = useState('drivers');

  const tabs = [
    { key: 'drivers', label: 'Motoristas', icon: Car },
    { key: 'passengers', label: 'Passageiros', icon: FileText },
    { key: 'races', label: 'Corridas', icon: BarChart3 },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><BarChart3 size={20} style={{ marginRight: '0.5rem' }} />Relatórios de Mobilidade</h3>
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
          {tab === 'drivers' && <DriversTab />}
          {tab === 'passengers' && <PassengersTab />}
          {tab === 'races' && <RacesTab />}
        </div>
      </div>
    </div>
  );
};

const DateFilterBar = ({ filters, onChange, onRefresh, loading }) => (
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#4b5563' }}>Início</label>
    <input type="date" value={filters.startDate} onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
      style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} />
    <label style={{ fontSize: '0.8rem', color: '#4b5563' }}>Fim</label>
    <input type="date" value={filters.endDate} onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
      style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} />
    <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}
      style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
      <option value="">Todos status</option>
      <option value="completed">Concluído</option>
      <option value="cancelled">Cancelado</option>
      <option value="pending">Pendente</option>
      <option value="accepted">Aceito</option>
      <option value="in_progress">Em andamento</option>
      <option value="matching">Buscando</option>
    </select>
    <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <RefreshCw size={14} className={loading ? 'spin' : ''} />Atualizar
    </button>
  </div>
);

const BalanceCards = ({ balance, fields }) => (
  <div className="stats-grid" style={{ marginBottom: '1rem' }}>
    {fields.map((f) => (
      <div key={f.key} className="stat-card" style={{ padding: '0.75rem' }}>
        <div className="stat-info">
          <h4 style={{ fontSize: '0.95rem' }}>{f.isCurrency ? fmtBRL(balance[f.key]) : fmtNum(balance[f.key])}</h4>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{f.label}</p>
        </div>
      </div>
    ))}
  </div>
);

const Pagination = ({ page, total, limit, onChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
      <button className="btn btn-secondary" disabled={page <= 0} onClick={() => onChange(page - 1)} style={{ padding: '0.3rem 0.5rem' }}>
        <ChevronLeft size={16} />
      </button>
      <span>Página {page + 1} de {totalPages} ({fmtNum(total)} registros)</span>
      <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ padding: '0.3rem 0.5rem' }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const DriversTab = () => {
  const [list, setList] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); const [limit, setLimit] = useState(10);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageIn: page, pageOut: limit };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      const [res, bal] = await Promise.all([
        mobilityReportService.admDriverReport(params),
        mobilityReportService.admDriverBalance(params),
      ]);
      const data = res?.data?.list ?? res?.list ?? (Array.isArray(res?.data) ? res.data : []);
      const tot = res?.data?.total ?? res?.total ?? 0;
      setList(data); setTotal(tot);
      const bData = bal?.data ?? bal;
      setBalance(bData && bData._id ? bData : null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(0); }, [filters.startDate, filters.endDate, filters.status]);

  const cols = [
    { key: 'date', title: 'Data', render: (v) => v || '-' },
    { key: 'driver', title: 'Motorista', render: (v) => (v && typeof v === 'object' ? v.name || v._id : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'estimatedPrice', title: 'Estimado', render: (v) => fmtBRL(v) },
    { key: 'finalPrice', title: 'Final', render: (v) => v ? fmtBRL(v) : '-' },
  ];

  return (
    <div>
      <DateFilterBar filters={filters} onChange={setFilters} onRefresh={load} loading={loading} />
      {balance && (
        <BalanceCards balance={balance} fields={[
          { key: 'approved_count', label: 'Concluídas' },
          { key: 'cancelled_count', label: 'Canceladas' },
          { key: 'totalRevenue', label: 'Receita Total', isCurrency: true },
          { key: 'totalDriverEarnings', label: 'Ganhos Motorista (80%)', isCurrency: true },
        ]} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#4b5563' }}>Relatório de Motoristas</h4>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>
      <DataTable data={list} columns={cols} loading={loading} emptyMessage="Nenhum registro de motorista" />
      <Pagination page={page} total={total} limit={limit} onChange={setPage} />
    </div>
  );
};

const PassengersTab = () => {
  const [list, setList] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); const [limit, setLimit] = useState(10);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageIn: page, pageOut: limit };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      const [res, bal] = await Promise.all([
        mobilityReportService.admPassengerReport(params),
        mobilityReportService.admPassengerBalance(params),
      ]);
      const data = res?.data?.list ?? res?.list ?? (Array.isArray(res?.data) ? res.data : []);
      const tot = res?.data?.total ?? res?.total ?? 0;
      setList(data); setTotal(tot);
      const bData = bal?.data ?? bal;
      setBalance(bData && bData._id ? bData : null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [filters.startDate, filters.endDate, filters.status]);

  const cols = [
    { key: 'date', title: 'Data', render: (v) => v || '-' },
    { key: 'client', title: 'Passageiro', render: (v) => (v && typeof v === 'object' ? v.name || v._id : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'estimatedPrice', title: 'Estimado', render: (v) => fmtBRL(v) },
    { key: 'finalPrice', title: 'Final', render: (v) => v ? fmtBRL(v) : '-' },
  ];

  return (
    <div>
      <DateFilterBar filters={filters} onChange={setFilters} onRefresh={load} loading={loading} />
      {balance && (
        <BalanceCards balance={balance} fields={[
          { key: 'approved', label: 'Concluídas' },
          { key: 'cancelled', label: 'Canceladas' },
          { key: 'total', label: 'Valor Total', isCurrency: true },
        ]} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#4b5563' }}>Relatório de Passageiros</h4>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>
      <DataTable data={list} columns={cols} loading={loading} emptyMessage="Nenhum registro de passageiro" />
      <Pagination page={page} total={total} limit={limit} onChange={setPage} />
    </div>
  );
};

const RacesTab = () => {
  const [list, setList] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); const [limit, setLimit] = useState(10);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageIn: page, pageOut: limit };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      const [res, bal] = await Promise.all([
        mobilityReportService.admRacesReport(params),
        mobilityReportService.admRacesBalance(params),
      ]);
      const data = res?.data?.list ?? res?.list ?? (Array.isArray(res?.data) ? res.data : []);
      const tot = res?.data?.total ?? res?.total ?? 0;
      setList(data); setTotal(tot);
      const bData = bal?.data ?? bal;
      setBalance(bData && bData._id ? bData : null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [filters.startDate, filters.endDate, filters.status]);

  const cols = [
    { key: 'date', title: 'Data', render: (v) => v || '-' },
    { key: 'client', title: 'Passageiro', render: (v) => (v && typeof v === 'object' ? v.name || v._id : v) || '-' },
    { key: 'driver', title: 'Motorista', render: (v) => (v && typeof v === 'object' ? v.name || v._id : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'estimatedPrice', title: 'Estimado', render: (v) => fmtBRL(v) },
    { key: 'finalPrice', title: 'Final', render: (v) => v ? fmtBRL(v) : '-' },
  ];

  return (
    <div>
      <DateFilterBar filters={filters} onChange={setFilters} onRefresh={load} loading={loading} />
      {balance && (
        <BalanceCards balance={balance} fields={[
          { key: 'approved', label: 'Concluídas' },
          { key: 'cancelled', label: 'Canceladas' },
          { key: 'total', label: 'Valor Total', isCurrency: true },
        ]} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#4b5563' }}>Relatório de Corridas</h4>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>
      <DataTable data={list} columns={cols} loading={loading} emptyMessage="Nenhuma corrida encontrada" />
      <Pagination page={page} total={total} limit={limit} onChange={setPage} />
    </div>
  );
};

export default MobilityReports;
