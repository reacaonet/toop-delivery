import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Search, Car, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { walletService, driverService } from '../services/api';

const WalletPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const result = await driverService.getDrivers();
      const list = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      setDrivers(list);
      if (list.length > 0 && !selectedDriver) {
        selectDriver(list[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectDriver = async (driver) => {
    setSelectedDriver(driver);
    setTxLoading(true);
    try {
      const [bal, txResult] = await Promise.all([
        walletService.getBalance(driver._id),
        walletService.getTransactions(driver._id, { limit: '50' }),
      ]);
      setBalance(bal);
      const txList = Array.isArray(txResult?.data) ? txResult.data : Array.isArray(txResult) ? txResult : [];
      setTransactions(txList);
    } catch (error) {
      console.error('Erro ao carregar wallet:', error);
      setBalance({ balance: 0, totalEarnings: 0, totalWithdrawals: 0 });
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedDriver || !amount) return;
    try {
      const value = parseFloat(amount);
      if (isNaN(value) || value <= 0) {
        alert('Valor deve ser maior que zero');
        return;
      }
      if (modalType === 'credit') {
        await walletService.credit(selectedDriver._id, value, description || 'Crédito manual');
      } else {
        await walletService.debit(selectedDriver._id, value, description || 'Débito manual');
      }
      setModalOpen(false);
      setAmount('');
      setDescription('');
      selectDriver(selectedDriver);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <h4>R$ {(balance?.balance || 0).toFixed(2)}</h4>
            <p>Saldo Atual</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>R$ {(balance?.totalEarnings || 0).toFixed(2)}</h4>
            <p>Total Ganhos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h4>R$ {(balance?.totalWithdrawals || 0).toFixed(2)}</h4>
            <p>Total Saques</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h4>{drivers.length}</h4>
            <p>Motoristas</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h3>Motoristas</h3>
          </div>
          <div style={{ padding: '0 1rem 1rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={16} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="Buscar motorista..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div className="loading" style={{ padding: '20px' }}><div className="spinner" /></div>
              ) : filteredDrivers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Nenhum motorista encontrado</p>
              ) : filteredDrivers.map(driver => (
                <div
                  key={driver._id}
                  onClick={() => selectDriver(driver)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedDriver?._id === driver._id ? '#f0f0ff' : 'transparent',
                    border: selectedDriver?._id === driver._id ? '1px solid #667eea' : '1px solid transparent',
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

        <div className="card">
          {selectedDriver ? (
            <>
              <div className="card-header">
                <h3>Wallet - {selectedDriver.name}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={() => { setModalType('credit'); setModalOpen(true); }}>
                    <ArrowUpCircle size={16} /> Creditar
                  </button>
                  <button className="btn btn-danger" onClick={() => { setModalType('debit'); setModalOpen(true); }}>
                    <ArrowDownCircle size={16} /> Debitar
                  </button>
                </div>
              </div>
              {txLoading ? (
                <div className="loading" style={{ padding: '2rem' }}><div className="spinner" /></div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Descrição</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma transação</td></tr>
                    ) : transactions.map(tx => (
                      <tr key={tx._id}>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                            backgroundColor: tx.type === 'credit' ? '#d1fae5' : '#fee2e2',
                            color: tx.type === 'credit' ? '#065f46' : '#991b1b',
                          }}>
                            {tx.type === 'credit' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                            {tx.type === 'credit' ? 'Crédito' : 'Débito'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                          R$ {tx.amount.toFixed(2)}
                        </td>
                        <td>{tx.description}</td>
                        <td style={{ fontSize: '0.8rem', color: '#888' }}>
                          {new Date(tx.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              Selecione um motorista para ver a wallet
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>{modalType === 'credit' ? 'Creditar' : 'Debitar'} - {selectedDriver?.name}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleTransaction}>
              <div className="form-group">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={modalType === 'credit' ? 'Ex: Bônus manual' : 'Ex: Taxa de plataforma'}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className={`btn ${modalType === 'credit' ? 'btn-primary' : 'btn-danger'}`}>
                  {modalType === 'credit' ? 'Creditar' : 'Debitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
