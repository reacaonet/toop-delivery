import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, Search, Car } from 'lucide-react';
import { mobilityExtractService, driverService, deliverymanService } from '../services/api';
import DataTable from '../components/DataTable';

const fmtBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

const flatRows = (groups) => {
  if (!groups || typeof groups !== 'object') return [];
  const rows = [];
  Object.keys(groups).forEach((key) => {
    const items = Array.isArray(groups[key]) ? groups[key] : [];
    items.forEach((it) => rows.push({ ...it, groupKey: key, monthTxt: it.monthTxt || key }));
  });
  return rows;
};

const MobilityExtract = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [extractLoading, setExtractLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const [drvResult, dmResult] = await Promise.all([
        driverService.getDrivers(),
        deliverymanService.getDeliverymen(),
      ]);
      const toList = (r) => Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
      const list = [
        ...toList(drvResult).map(d => ({ ...d, tipo: 'motorista' })),
        ...toList(dmResult).map(d => ({ ...d, tipo: 'entregador' })),
      ];
      setDrivers(list);
      if (list.length > 0 && !selectedDriver) {
        selectDriver(list[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectDriver = useCallback(async (driver) => {
    setSelectedDriver(driver);
    setExtractLoading(true);
    try {
      const result = await mobilityExtractService.getDriverBalance(driver._id);
      const data = result?.data ?? result;
      setGroups(data && typeof data === 'object' ? data : {});
    } catch (error) {
      console.error('Erro ao carregar extrato:', error);
      setGroups({});
    } finally {
      setExtractLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    if (selectedDriver) selectDriver(selectedDriver);
  };

  const filteredDrivers = drivers.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rows = flatRows(groups);
  const monthKeys = Object.keys(groups);
  const totalGeral = rows.reduce((acc, it) => acc + Number(it.price || 0), 0);

  const cols = [
    { key: 'groupKey', title: 'Mês', render: (v) => v || '-' },
    { key: 'monthTxt', title: 'Mês (texto)', render: (v) => v || '-' },
    { key: 'price', title: 'Valor', render: (v) => fmtBRL(v) },
    { key: 'createdAt', title: 'Data', render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Wallet size={20} style={{ marginRight: '0.5rem' }} />Extrato de Mobilidade</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', padding: '1rem' }}>
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <h3><Car size={16} style={{ marginRight: '0.4rem' }} />Motoristas</h3>
            </div>
            <div style={{ padding: '0 1rem 1rem' }}>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Buscar motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="loading" style={{ padding: '20px' }}><div className="spinner" /></div>
                ) : filteredDrivers.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Nenhum motorista encontrado</p>
                ) : filteredDrivers.map((driver) => (
                  <div
                    key={driver._id}
                    onClick={() => selectDriver(driver)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedDriver?._id === driver._id ? '#ecfdf5' : 'transparent',
                      border: selectedDriver?._id === driver._id ? '1px solid #10b981' : '1px solid transparent',
                      marginBottom: '4px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{driver.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{driver.email}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {selectedDriver && (
              <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
                <h3>Extrato - {selectedDriver.name}</h3>
                <button className="btn btn-secondary" onClick={refresh} disabled={extractLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RefreshCw size={14} className={extractLoading ? 'spin' : ''} />Atualizar
                </button>
              </div>
            )}

            {monthKeys.length > 0 && (
              <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                <div className="stat-card" style={{ padding: '0.75rem' }}>
                  <div className="stat-info">
                    <h4 style={{ fontSize: '0.95rem' }}>{fmtBRL(totalGeral)}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Geral</p>
                  </div>
                </div>
                <div className="stat-card" style={{ padding: '0.75rem' }}>
                  <div className="stat-info">
                    <h4 style={{ fontSize: '0.95rem' }}>{fmtNum(rows.length)}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Lançamentos</p>
                  </div>
                </div>
                <div className="stat-card" style={{ padding: '0.75rem' }}>
                  <div className="stat-info">
                    <h4 style={{ fontSize: '0.95rem' }}>{fmtNum(monthKeys.length)}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Meses</p>
                  </div>
                </div>
              </div>
            )}

            {extractLoading ? (
              <div className="loading" style={{ padding: '2rem' }}><div className="spinner" /></div>
            ) : selectedDriver ? (
              <DataTable data={rows} columns={cols} loading={extractLoading} emptyMessage="Nenhum lançamento para este motorista" />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                Selecione um motorista para ver o extrato
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilityExtract;