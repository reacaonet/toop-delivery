import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { walletService } from '../api'

interface Transaction {
  _id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  bookingId?: string
  createdAt: string
}

interface WalletBalance {
  balance: number
  totalEarnings: number
  totalWithdrawals: number
}

const EarningsPage: React.FC = () => {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletBalance>({ balance: 0, totalEarnings: 0, totalWithdrawals: 0 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpLoading, setTopUpLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [walletData, txData] = await Promise.allSettled([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 100 })
      ])

      if (walletData.status === 'fulfilled') {
        const w = walletData.value as any
        setWallet({
          balance: w.balance || 0,
          totalEarnings: w.totalEarnings || 0,
          totalWithdrawals: w.totalWithdrawals || 0
        })
      }

      if (txData.status === 'fulfilled') {
        const t = txData.value as any
        setTransactions(Array.isArray(t) ? t : t.transactions || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filterByPeriod = (txs: Transaction[]) => {
    const now = new Date()
    if (period === 'all') return txs
    return txs.filter(tx => {
      const d = new Date(tx.createdAt)
      if (period === 'today') return d.toDateString() === now.toDateString()
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return d >= weekAgo
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }

  const filtered = filterByPeriod(transactions)
  const periodCredits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const periodDebits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const periodNet = periodCredits - periodDebits

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount)
    if (!amount || amount <= 0) return
    setTopUpLoading(true)
    try {
      await walletService.credit(amount, 'Recarga via app')
      setShowTopUp(false)
      setTopUpAmount('')
      fetchData()
    } catch {
    } finally {
      setTopUpLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="earnings-page">
      <div className="earnings-header">
        <button className="btn-back" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Ganhos</h1>
      </div>

      {/* Wallet Balance Card */}
      <div className="earnings-wallet-card">
        <div className="earnings-wallet-icon">
          <Wallet size={28} color="#fff" />
        </div>
        <div className="earnings-wallet-info">
          <span className="earnings-wallet-label">Saldo Disponível</span>
          <span className="earnings-wallet-amount">R$ {wallet.balance.toFixed(2)}</span>
        </div>
        <button className="earnings-topup-btn" onClick={() => setShowTopUp(true)}>
          <DollarSign size={16} /> Recarregar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="earnings-stats-grid">
        <div className="earnings-stat-card green">
          <TrendingUp size={20} />
          <div className="earnings-stat-info">
            <span>Ganhos Totais</span>
            <strong>R$ {wallet.totalEarnings.toFixed(2)}</strong>
          </div>
        </div>
        <div className="earnings-stat-card red">
          <TrendingDown size={20} />
          <div className="earnings-stat-info">
            <span>Retiradas</span>
            <strong>R$ {wallet.totalWithdrawals.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="earnings-period-filter">
        {(['today', 'week', 'month', 'all'] as const).map(p => (
          <button
            key={p}
            className={`earnings-period-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}
          </button>
        ))}
      </div>

      {/* Period Summary */}
      <div className="earnings-period-summary">
        <div className="earnings-period-row">
          <span>Ganhos no período</span>
          <span className="green">+ R$ {periodCredits.toFixed(2)}</span>
        </div>
        <div className="earnings-period-row">
          <span>Gastos no período</span>
          <span className="red">- R$ {periodDebits.toFixed(2)}</span>
        </div>
        <div className="earnings-period-row total">
          <span>Lucro líquido</span>
          <span className={periodNet >= 0 ? 'green' : 'red'}>R$ {periodNet.toFixed(2)}</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="earnings-transactions">
        <h3>Transações ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <div className="earnings-empty">
            <Calendar size={32} color="#9ca3af" />
            <span>Nenhuma transação no período</span>
          </div>
        ) : (
          filtered.map(tx => (
            <div key={tx._id} className={`earnings-tx ${tx.type}`}>
              <div className="earnings-tx-icon">
                {tx.type === 'credit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="earnings-tx-info">
                <span className="earnings-tx-desc">{tx.description || (tx.type === 'credit' ? 'Ganho' : 'Débito')}</span>
                <span className="earnings-tx-date">{new Date(tx.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className={`earnings-tx-amount ${tx.type}`}>
                {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Recarregar Carteira</h3>
            <div className="modal-field">
              <label>Valor (R$)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowTopUp(false)}>Cancelar</button>
              <button className="modal-btn confirm" onClick={handleTopUp} disabled={topUpLoading || !topUpAmount}>
                {topUpLoading ? 'Recarregando...' : 'Recarregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EarningsPage
