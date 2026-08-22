import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Package, DollarSign, TrendingUp, Clock, XCircle, CheckCircle, BarChart3, RefreshCw, User } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em Preparo',
  ready: 'Pronto',
  delivering: 'A Caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#6366f1',
  preparing: '#f97316',
  ready: '#f97316',
  delivering: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: '7 dias' },
  { value: '30days', label: '30 dias' },
  { value: 'all', label: 'Todos' },
]

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0)

const formatDate = (d: string) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

interface Order {
  _id: string
  orderNumber: number
  status: string
  total: number
  subtotal: number
  deliveryFee: number
  createdAt: string
  customer?: { name?: string } | null
  items?: Array<{ name: string; quantity: number; price: number; total: number }>
  paymentMethod?: string
}

interface Product {
  _id: string
  name?: string
  price?: number
}

const DashboardPage = () => {
  const { companyId } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders', { params: { company: companyId, limit: 1000 } }),
        api.get(`/products/company/${companyId}`),
      ])

      const ordersData = ordersRes.data?.data ?? ordersRes.data
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      const productsData = productsRes.data?.data ?? productsRes.data
      setProducts(Array.isArray(productsData) ? productsData : Array.isArray(productsData?.data) ? productsData.data : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders
    const now = new Date()
    const start = new Date()
    if (period === 'today') start.setHours(0, 0, 0, 0)
    else if (period === '7days') start.setDate(now.getDate() - 7)
    else if (period === '30days') start.setDate(now.getDate() - 30)
    return orders.filter(o => new Date(o.createdAt) >= start)
  }, [orders, period])

  const stats = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered')
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled')
    const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0)
    const avgTicket = delivered.length > 0 ? totalRevenue / delivered.length : 0

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart)

    const pending = filteredOrders.filter(o => o.status === 'pending').length
    const preparing = filteredOrders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length

    const statusCounts: Record<string, number> = {}
    Object.keys(STATUS_LABELS).forEach(s => { statusCounts[s] = 0 })
    filteredOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })

    return {
      total: filteredOrders.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      totalRevenue,
      avgTicket,
      todayOrders: todayOrders.length,
      pending,
      preparing,
      statusCounts,
    }
  }, [filteredOrders, orders])

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
  }, [filteredOrders])

  const maxStatusCount = Math.max(...Object.values(stats.statusCounts), 1)

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Visao geral da loja
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRight: '1px solid var(--border)',
                  background: period === p.value ? 'var(--primary)' : 'white',
                  color: period === p.value ? 'white' : 'var(--text-secondary)',
                  fontWeight: period === p.value ? 600 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Pedidos</span>
            <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Entregues</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{stats.delivered}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Receita</span>
            <span className="stat-value" style={{ color: '#f59e0b', fontSize: '1.3rem' }}>{formatCurrency(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
            <BarChart3 size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Ticket Medio</span>
            <span className="stat-value" style={{ color: '#8b5cf6', fontSize: '1.3rem' }}>{formatCurrency(stats.avgTicket)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            <Clock size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Pedidos Hoje</span>
            <span className="stat-value" style={{ color: '#0ea5e9' }}>{stats.todayOrders}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Cancelados</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{stats.cancelled}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Pendentes</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#6366f1' }}>
            <Package size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Produtos</span>
            <span className="stat-value" style={{ color: '#6366f1' }}>{products.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Orders by Status */}
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={20} style={{ marginRight: '0.5rem' }} /> Pedidos por Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '110px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {STATUS_LABELS[status]}
                </span>
                <div style={{ flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / maxStatusCount) * 100}%`,
                    height: '100%',
                    background: STATUS_COLORS[status],
                    borderRadius: '6px',
                    transition: 'width 0.5s ease',
                    minWidth: count > 0 ? '4px' : '0',
                  }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="card">
          <div className="card-header">
            <h3><DollarSign size={20} style={{ marginRight: '0.5rem' }} /> Por Pagamento</h3>
          </div>
          {(() => {
            const methods: Record<string, { count: number; total: number }> = {}
            filteredOrders.forEach(o => {
              const m = o.paymentMethod || 'other'
              if (!methods[m]) methods[m] = { count: 0, total: 0 }
              methods[m].count += 1
              methods[m].total += o.total || 0
            })
            const map: Record<string, string> = { credit_card: 'Cartao Credito', debit_card: 'Cartao Debito', pix: 'PIX', cash: 'Dinheiro' }
            const entries = Object.entries(methods)
            if (entries.length === 0) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {entries.map(([method, data]) => (
                  <div key={method} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{map[method] || method}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{data.count} pedidos</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(data.total)}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3><Clock size={20} style={{ marginRight: '0.5rem' }} /> Pedidos Recentes</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state">Nenhum pedido encontrado</div>
        ) : (
          <div className="order-list">
            {recentOrders.map((order) => (
              <div key={order._id} className="order-list-item">
                <div className="order-list-info">
                  <span className="order-number">#{order.orderNumber}</span>
                  <span className="order-customer">{order.customer?.name || 'Cliente'}</span>
                </div>
                <div className="order-list-meta">
                  <span
                    className="badge"
                    style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="order-total">{formatCurrency(order.total)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
