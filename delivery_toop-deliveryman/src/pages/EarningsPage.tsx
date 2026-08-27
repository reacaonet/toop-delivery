import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { walletService, bookingService } from '../api'

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

  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawPixKey, setWithdrawPixKey] = useState('')
  const [withdrawPixType, setWithdrawPixType] = useState<string>('cpf')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const [rides, setRides] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    try {
      const [walletData, txData, rideData] = await Promise.allSettled([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 100 }),
        bookingService.getBookings({ status: 'completed' }),
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

      if (rideData.status === 'fulfilled') {
        const r = rideData.value as any
        setRides(Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [])
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

  // Ride earnings computed per completed booking (not accumulated)
  const rideEarningsTotal = rides.reduce((s, r) => s + (r.finalPrice || r.estimatedPrice || 0), 0)
  const ridesToday = rides.filter(r => {
    const d = new Date(r.completedAt || r.updatedAt || r.createdAt)
    return d.toDateString() === new Date().toDateString()
  })
  const rideEarningsToday = ridesToday.reduce((s, r) => s + (r.finalPrice || r.estimatedPrice || 0), 0)

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

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0 || amount > wallet.balance) return
    if (!withdrawPixKey.trim()) return
    setWithdrawLoading(true)
    try {
      await walletService.withdraw(amount, withdrawPixKey, withdrawPixType)
      setShowWithdraw(false)
      setWithdrawAmount('')
      setWithdrawPixKey('')
      setWithdrawPixType('cpf')
      fetchData()
      alert('Solicitacao de saque enviada com sucesso!')
    } catch (err: any) {
      alert('Erro ao solicitar saque: ' + (err.response?.data?.error || err.message))
    } finally {
      setWithdrawLoading(false)
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
        <button className="earnings-topup-btn" onClick={() => setShowWithdraw(true)}>
          <CreditCard size={16} /> Sacar
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

      {/* Ride Earnings (per completed ride) */}
      <div className="earnings-rides-card">
        <div className="earnings-rides-header">
          <strong>Ganhos com Corridas</strong>
          <span>{ridesToday.length} corrida(s) hoje</span>
        </div>
        <div className="earnings-rides-grid">
          <div className="earnings-rides-item">
            <span className="earnings-rides-label">Hoje</span>
            <strong className="green">R$ {rideEarningsToday.toFixed(2)}</strong>
          </div>
          <div className="earnings-rides-item">
            <span className="earnings-rides-label">Total</span>
            <strong className="green">R$ {rideEarningsTotal.toFixed(2)}</strong>
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Solicitar Saque</h3>
            <div className="modal-field">
              <label>Saldo disponivel: R$ {wallet.balance.toFixed(2)}</label>
            </div>
            <div className="modal-field">
              <label>Valor (R$)</label>
              <input
                type="number"
                min="0.01"
                max={wallet.balance}
                step="0.01"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Chave PIX</label>
              <input
                type="text"
                placeholder="Sua chave PIX"
                value={withdrawPixKey}
                onChange={e => setWithdrawPixKey(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Tipo da Chave PIX</label>
              <select value={withdrawPixType} onChange={e => setWithdrawPixType(e.target.value)}>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Celular</option>
                <option value="random">Aleatoria</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowWithdraw(false)}>Cancelar</button>
              <button
                className="modal-btn confirm"
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || !withdrawPixKey || parseFloat(withdrawAmount) > wallet.balance}
              >
                {withdrawLoading ? 'Enviando...' : 'Solicitar Saque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EarningsPage
