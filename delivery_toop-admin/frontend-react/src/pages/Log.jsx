import React, { useState, useEffect } from 'react';
import { ScrollText, Database, RefreshCw } from 'lucide-react';
import { logService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Log = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(25);

  const load = async (limit = perPage) => {
    setLoading(true);
    try {
      const res = await logService.paginator({ pageIn: 0, pageOut: limit });
      setItems(extractList(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const colorByLevel = (v) => {
    const s = (v || '').toUpperCase();
    if (s.includes('ERRO') || s.includes('ERROR')) return '#ef4444';
    if (s.includes('WARN') || s.includes('AVISO')) return '#f59e0b';
    if (s.includes('INFO')) return '#3b82f6';
    return '#6b7280';
  };

  const cols = [
    { key: 'level', title: 'Nível', render: (v) => <span className="badge" style={{ background: '#f3f4f6', color: colorByLevel(v), fontWeight: 700 }}>{v || '-'}</span> },
    { key: 'message', title: 'Mensagem', render: (v) => (v && String(v).length > 90 ? String(v).slice(0, 90) + '…' : v) || '-' },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    { key: 'createdAt', title: 'Data', render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><ScrollText size={20} style={{ marginRight: '0.5rem' }} />Log / Auditoria</h3>
          <div>
            <select value={perPage} onChange={(e) => { const v = Number(e.target.value); setPerPage(v); load(v); }} style={{ padding: '0.4rem', marginRight: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              {[25, 50, 100].map((n) => <option key={n} value={n}>{n} por página</option>)}
            </select>
            <button className="btn btn-secondary" onClick={() => load()}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          </div>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.75rem' }}><Database size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />Histórico de logs do sistema (somente leitura).</p>
          <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum log registrado" />
        </div>
      </div>
    </div>
  );
};

export default Log;
