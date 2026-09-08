import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Activity, ScrollText } from 'lucide-react';
import { accessFlowService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtId = (v) => {
  if (v === undefined || v === null || v === '') return '-';
  if (typeof v === 'object') return v._id || JSON.stringify(v);
  return String(v);
};

const toString = (v) => (v === undefined || v === null ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v));

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const extractCount = (res) => {
  if (!res) return 0;
  if (typeof res === 'number') return res;
  if (res.count !== undefined) return Number(res.count) || 0;
  return 0;
};

const AccessFlow = () => {
  const [days, setDays] = useState([]);
  const [count, setCount] = useState(0);
  const [timeInterval, setTimeInterval] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStat, setLoadingStat] = useState(false);
  const [error, setError] = useState('');

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const res = await accessFlowService.list();
      setDays(extractList(res));
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao carregar fluxo de acessos');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadStat = useCallback(async () => {
    setLoadingStat(true);
    try {
      const res = await accessFlowService.statistic(timeInterval);
      setCount(extractCount(res));
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao carregar estatística');
    } finally {
      setLoadingStat(false);
    }
  }, [timeInterval]);

  const refresh = useCallback(() => {
    loadList();
    loadStat();
  }, [loadList, loadStat]);

  useEffect(() => { loadList(); loadStat(); }, [loadList, loadStat]);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><ScrollText size={20} style={{ marginRight: '0.5rem' }} />Fluxo de Acessos</h3>
          <button className="btn btn-secondary" onClick={refresh} disabled={loadingList || loadingStat}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RefreshCw size={14} className={loadingList || loadingStat ? 'spin' : ''} />Atualizar
          </button>
        </div>

        <div className="stats-grid" style={{ marginBottom: '1rem' }}>
          <div className="stat-card" style={{ padding: '0.75rem' }}>
            <div className="stat-info">
              <h4 style={{ fontSize: '1.5rem' }}>{count}</h4>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <Activity size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Acessos nos últimos {timeInterval || '0'} dia(s)
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', padding: '0 1rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563' }}>Intervalo (dias)</label>
            <input
              type="number"
              min="0"
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value === '' ? 0 : Number(e.target.value))}
              style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', width: '100px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={loadStat} disabled={loadingStat}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1.1rem' }}>
            <BarChart3 size={14} />Consultar
          </button>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: '1rem' }}>{error}</div>}

        <div style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.75rem' }}>
            Acessos por dia ({days.length} dia(s))
          </h4>
          {days.length === 0 && !loadingList ? (
            <DataTable data={[]} columns={[]} loading={false} emptyMessage="Nenhum acesso registrado" />
          ) : (
            days.map((day) => <DayCard key={`${day?._id?.year}-${day?._id?.month}-${day?._id?.day}`} day={day} />)
          )}
        </div>
      </div>
    </div>
  );
};

const DayCard = ({ day }) => {
  const items = Array.isArray(day.accessInfo) ? day.accessInfo : [];
  const dateStr = day._id
    ? `${String(day._id.day).padStart(2, '0')}/${String(day._id.month).padStart(2, '0')}/${day._id.year}`
    : '-';

  const cols = [
    { key: 'device', title: 'Dispositivo', render: toString },
    { key: 'customer', title: 'Cliente (ID)', render: fmtId },
    { key: 'person', title: 'Pessoa (ID)', render: fmtId },
    { key: 'franchise', title: 'Franquia (ID)', render: fmtId },
    { key: 'version', title: 'Versão', render: toString },
    { key: 'history', title: 'Histórico', render: toString },
    { key: 'createdAt', title: 'Criado em', render: fmtDate },
    { key: 'updatedAt', title: 'Atualizado em', render: fmtDate },
  ];

  return (
    <div className="card" style={{ marginBottom: '1rem', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
      <div className="card-header" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: '0.9rem' }}><BarChart3 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />{dateStr}</h4>
        <span className="badge">{items.length} acesso(s)</span>
      </div>
      <div style={{ padding: '0.75rem' }}>
        <DataTable data={items} columns={cols} loading={false} emptyMessage="Sem registros neste dia" />
      </div>
    </div>
  );
};

export default AccessFlow;
