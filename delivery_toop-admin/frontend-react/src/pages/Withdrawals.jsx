import React, { useState, useEffect, useCallback } from 'react';
import { Banknote, CheckCircle, XCircle, Clock, RefreshCw, User, Filter } from 'lucide-react';
import { walletService } from '../services/api';

const STATUS_LABEL = {
  pending: 'Pendente',
  completed: 'Aprovado',
  failed: 'Rejeitado',
};

const STATUS_COLOR = {
  pending: { background: '#fef3c7', color: '#92400e' },
  completed: { background: '#d1fae5', color: '#065f46' },
  failed: { background: '#fee2e2', color: '#991b1b' },
};

const PIX_TYPE_LABEL = {
  cpf: 'CPF',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Aleatória',
};

const Withdrawals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await walletService.listWithdrawals({ status: filter, limit: '50' });
      const list = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      setItems(list);
    } catch (error) {
      console.error('Erro ao carregar solicitações de saque:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id, type) => {
    setActionLoading(type + id);
    try {
      if (type === 'approve') {
        await walletService.approveWithdrawal(id);
      } else {
        await walletService.rejectWithdrawal(id);
      }
      setConfirm(null);
      load();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;

  const stats = [
    { label: 'Pendentes', value: pendingCount, icon: <Clock size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Aprovados', value: items.filter(i => i.status === 'completed').length, icon: <CheckCircle size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Rejeitados', value: items.filter(i => i.status === 'failed').length, icon: <XCircle size={24} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Total (filtro)', value: items.length, icon: <Banknote size={24} />, color: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ backgroundColor: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <h4>{s.value}</h4>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            <Banknote size={20} style={{ marginRight: '0.5rem' }} />
            Solicitações de Saque
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Filter size={16} style={{ color: '#888' }} />
              {['pending', 'completed', 'failed', 'all'].map(s => (
                <button
                  key={s}
                  className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(s)}
                >
                  {STATUS_LABEL[s] || 'Todos'}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={load}>
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading" style={{ padding: '2rem' }}><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Nenhuma solicitação de saque encontrada
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Chave PIX</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(tx => (
                <tr key={tx._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: '#888' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{tx.driver?.name || '—'}</div>
                        {tx.driver?.email && (
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{tx.driver.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {tx.wallet?.pixKey ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{tx.wallet.pixKey}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          {PIX_TYPE_LABEL[tx.wallet.pixType] || tx.wallet.pixType || '—'}
                        </div>
                      </div>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={{ fontWeight: 600, color: '#ef4444' }}>R$ {tx.amount.toFixed(2)}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                      ...STATUS_COLOR[tx.status],
                    }}>
                      {tx.status === 'completed' ? <CheckCircle size={12} /> : tx.status === 'failed' ? <XCircle size={12} /> : <Clock size={12} />}
                      {STATUS_LABEL[tx.status]}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(tx.createdAt).toLocaleDateString('pt-BR')} {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {tx.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === 'approve' + tx._id}
                          onClick={() => setConfirm({ tx, type: 'approve' })}
                        >
                          {actionLoading === 'approve' + tx._id ? <div className="spinner" style={{ width: '12px', height: '12px' }} /> : <CheckCircle size={14} />}
                          {' Aprovar'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading === 'reject' + tx._id}
                          onClick={() => setConfirm({ tx, type: 'reject' })}
                        >
                          {actionLoading === 'reject' + tx._id ? <div className="spinner" style={{ width: '12px', height: '12px' }} /> : <XCircle size={14} />}
                          {' Rejeitar'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>{confirm.type === 'approve' ? 'Aprovar saque' : 'Rejeitar saque'}</h3>
              <button className="close-btn" onClick={() => setConfirm(null)}>&times;</button>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              {confirm.type === 'approve'
                ? `Confirmar a transferência de R$ ${confirm.tx.amount.toFixed(2)} para ${confirm.tx.driver?.name || 'o motorista'}?`
                : `Rejeitar a solicitação de R$ ${confirm.tx.amount.toFixed(2)} de ${confirm.tx.driver?.name || 'o motorista'}? O valor será estornado para a wallet.`}
            </p>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button type="button" className={`btn ${confirm.type === 'approve' ? 'btn-primary' : 'btn-danger'}`} onClick={() => handleAction(confirm.tx._id, confirm.type)}>
                {confirm.type === 'approve' ? 'Aprovar' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;