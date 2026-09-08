import React, { useState, useEffect, useCallback } from 'react';
import { Map, Radio, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityMonitorService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtNum = (v) => (v || v === 0 ? Number(v).toLocaleString('pt-BR') : '-');

const nameOf = (obj) => (obj && typeof obj === 'object' ? obj.name || obj._id || '-' : obj || '-');
const coordOf = (loc) => {
  if (!loc) return '-';
  const lat = loc.latitude ?? loc.lat ?? loc[1];
  const lng = loc.longitude ?? loc.lng ?? loc[0];
  if (lat === undefined || lng === undefined) return '-';
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};
const dateOf = (v) => (v ? new Date(v).toLocaleString('pt-BR') : '-');

const MobilityMonitor = () => {
  const [tab, setTab] = useState('map');

  const tabs = [
    { key: 'map', label: 'Monitoramento no Mapa', icon: Map },
    { key: 'active', label: 'Monitoramento Ativo', icon: Radio },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Map size={20} style={{ marginRight: '0.5rem' }} />Monitoramento de Mobilidade</h3>
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
          {tab === 'map' && <MapMonitoringTab />}
          {tab === 'active' && <ActiveMonitoringTab />}
        </div>
      </div>
    </div>
  );
};

const RefreshButton = ({ onRefresh, loading }) => (
  <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}
    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
    <RefreshCw size={14} className={loading ? 'spin' : ''} />Atualizar
  </button>
);

const MapMonitoringTab = () => {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mobilityMonitorService.mapMonitoring({ pageIn: page, pageOut: limit });
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.list) ? res.list : []));
      setList(data);
      setHasNext(data.length >= limit);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, limit]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { key: 'client', title: 'Passageiro', render: (v) => nameOf(v) },
    { key: 'driver', title: 'Motorista', render: (v) => nameOf(v) },
    { key: 'driver', title: 'Local Motorista', render: (v) => (v && typeof v === 'object' ? coordOf(v.currentLocation || v.location || v.coordinates) : '-') },
    { key: 'pickup', title: 'Origem', render: (v) => (v && typeof v === 'object' ? coordOf(v.location || v.coordinates) : '-') },
    { key: 'dropoff', title: 'Destino', render: (v) => (v && typeof v === 'object' ? coordOf(v.location || v.coordinates) : '-') },
    { key: 'statusTxt', title: 'Status', render: (v, item) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || item?.status || '-'}</span> },
    { key: 'vehicleType', title: 'Veículo', render: (v) => v || '-' },
    { key: 'estimatedPrice', title: 'Estimado', render: (v) => v ? fmtBRL(v) : '-' },
    { key: 'distance', title: 'Distância', render: (v) => (v ? `${fmtNum(v)} km` : '-') },
    { key: 'duration', title: 'Duração', render: (v) => (v ? `${fmtNum(v)} min` : '-') },
    { key: 'scheduledAt', title: 'Agendado', render: (v) => dateOf(v) },
    { key: 'createdAt', title: 'Criado em', render: (v) => dateOf(v) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>Corridas Ativas no Mapa</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
          <RefreshButton onRefresh={load} loading={loading} />
        </div>
      </div>
      <DataTable data={list} columns={cols} loading={loading} emptyMessage="Nenhuma corrida ativa no mapa" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
        <button className="btn btn-secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} style={{ padding: '0.3rem 0.5rem' }}>
          <ChevronLeft size={16} />
        </button>
        <span>Página {page}</span>
        <button className="btn btn-secondary" disabled={!hasNext || loading} onClick={() => setPage(page + 1)} style={{ padding: '0.3rem 0.5rem' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const ActiveMonitoringTab = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mobilityMonitorService.activeMonitoring({});
      setInfo(res?.data ?? res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>Monitoramento Ativo</h4>
        <RefreshButton onRefresh={load} loading={loading} />
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : info ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div><strong>Chave:</strong> {info.key || '-'}</div>
          <div><strong>Valor:</strong> {info.value || '-'}</div>
        </div>
      ) : (
        <div className="loading"><p>Nenhum dado de monitoramento ativo</p></div>
      )}
    </div>
  );
};

export default MobilityMonitor;
