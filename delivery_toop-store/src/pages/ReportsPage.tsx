import { useState, useEffect, useMemo } from 'react'
import { FileText, Download, Calendar, Filter, ShoppingCart, DollarSign, Package, Clock } from 'lucide-react'
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

const TABS = [
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'hourly', label: 'Horarios', icon: Clock },
]

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0)

const formatDate = (d: string) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const exportCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface Order {
  _id: string
  orderNumber: number
  status: string
  total: number
  subtotal: number
  deliveryFee: number
  discount?: number
  createdAt: string
  customer?: { name?: string } | null
  items?: OrderItem[]
  paymentMethod?: string
}

const ReportsPage = () => {
  const { companyId } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders', { params: { company: companyId, limit: 2000 } })
      const data = res.data?.data ?? res.data
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      result = result.filter(o => new Date(o.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter(o => new Date(o.createdAt) <= to)
    }
    return result
  }, [orders, dateFrom, dateTo])

  // ============ DATA ============

  const statusReport = useMemo(() => {
    const counts: Record<string, number> = {}
    const totals: Record<string, number> = {}
    Object.keys(STATUS_LABELS).forEach(s => { counts[s] = 0; totals[s] = 0 })
    filteredOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1
      totals[o.status] = (totals[o.status] || 0) + (o.total || 0)
    })
    return Object.keys(STATUS_LABELS).map(s => ({
      status: s,
      label: STATUS_LABELS[s],
      count: counts[s],
      total: totals[s],
      pct: filteredOrders.length > 0 ? ((counts[s] / filteredOrders.length) * 100).toFixed(1) : '0',
    }))
  }, [filteredOrders])

  const paymentReport = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {}
    filteredOrders.forEach(o => {
      const m = o.paymentMethod || 'other'
      if (!methods[m]) methods[m] = { count: 0, total: 0 }
      methods[m].count += 1
      methods[m].total += o.total || 0
    })
    const map: Record<string, string> = { credit_card: 'Cartao Credito', debit_card: 'Cartao Debito', pix: 'PIX', cash: 'Dinheiro' }
    return Object.entries(methods).map(([k, v]) => ({ method: map[k] || k, ...v }))
  }, [filteredOrders])

  const financialReport = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered')
    const totalGross = delivered.reduce((s, o) => s + (o.total || 0), 0)
    const totalSubtotal = delivered.reduce((s, o) => s + (o.subtotal || 0), 0)
    const totalDelivery = delivered.reduce((s, o) => s + (o.deliveryFee || 0), 0)
    const totalDiscount = delivered.reduce((s, o) => s + (o.discount || 0), 0)
    const avgTicket = delivered.length > 0 ? totalGross / delivered.length : 0
    const avgDelivery = delivered.length > 0 ? totalDelivery / delivered.length : 0

    return {
      deliveredCount: delivered.length,
      cancelledCount: filteredOrders.filter(o => o.status === 'cancelled').length,
      totalGross,
      totalSubtotal,
      totalDelivery,
      totalDiscount,
      avgTicket,
      avgDelivery,
    }
  }, [filteredOrders])

  const productReport = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number; orders: number }> = {}
    filteredOrders.filter(o => o.status === 'delivered').forEach(o => {
      o.items?.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, quantity: 0, revenue: 0, orders: 0 }
        map[item.name].quantity += item.quantity
        map[item.name].revenue += item.total || item.price * item.quantity
        map[item.name].orders += 1
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue)
  }, [filteredOrders])

  const hourlyReport = useMemo(() => {
    const hours: Record<number, { count: number; revenue: number }> = {}
    for (let i = 0; i < 24; i++) { hours[i] = { count: 0, revenue: 0 } }
    filteredOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours()
      hours[h].count += 1
      hours[h].revenue += o.total || 0
    })
    return Object.entries(hours).map(([h, data]) => ({
      hour: parseInt(h),
      label: `${String(h).padStart(2, '0')}h`,
      count: data.count,
      revenue: data.revenue,
    }))
  }, [filteredOrders])

  const maxHourlyCount = Math.max(...hourlyReport.map(h => h.count), 1)

  // ============ EXPORT ============

  const exportOrdersCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Status', 'Subtotal', 'Frete', 'Desconto', 'Total', 'Pagamento', 'Data']
    const rows = filteredOrders.map(o => [
      o.orderNumber || '',
      o.customer?.name || '',
      STATUS_LABELS[o.status] || o.status,
      (o.subtotal || 0).toFixed(2),
      (o.deliveryFee || 0).toFixed(2),
      (o.discount || 0).toFixed(2),
      (o.total || 0).toFixed(2),
      o.paymentMethod || '',
      formatDate(o.createdAt),
    ])
    exportCSV(headers, rows, 'relatorio_pedidos_loja')
  }

  const exportFinancialCSV = () => {
    const headers = ['Metrica', 'Valor']
    const rows = [
      ['Pedidos Entregues', financialReport.deliveredCount],
      ['Pedidos Cancelados', financialReport.cancelledCount],
      ['Receita Total', financialReport.totalGross.toFixed(2)],
      ['Subtotal Produtos', financialReport.totalSubtotal.toFixed(2)],
      ['Total Frete', financialReport.totalDelivery.toFixed(2)],
      ['Total Descontos', financialReport.totalDiscount.toFixed(2)],
      ['Ticket Medio', financialReport.avgTicket.toFixed(2)],
      ['Frete Medio', financialReport.avgDelivery.toFixed(2)],
    ]
    exportCSV(headers, rows, 'relatorio_financeiro_loja')
  }

  const exportProductsCSV = () => {
    const headers = ['Produto', 'Vendidos', 'Receita', 'Pedidos']
    const rows = productReport.map(p => [p.name, p.quantity, p.revenue.toFixed(2), p.orders])
    exportCSV(headers, rows, 'relatorio_produtos_loja')
  }

  const exportHourlyCSV = () => {
    const headers = ['Horario', 'Pedidos', 'Receita']
    const rows = hourlyReport.map(h => [h.label, h.count, h.revenue.toFixed(2)])
    exportCSV(headers, rows, 'relatorio_horarios_loja')
  }

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Relatorios</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Analise de desempenho da loja
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Periodo:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} color="#9ca3af" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem' }}
            />
            <span style={{ color: '#9ca3af' }}>ate</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem' }}
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              className="btn btn-secondary"
              onClick={() => { setDateFrom(''); setDateTo('') }}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Limpar Filtro
            </button>
          )}

          <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: 'auto' }}>
            {filteredOrders.length} pedidos
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
                background: 'none', cursor: 'pointer',
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                marginBottom: '-2px',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Orders */}
      {tab === 'orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3>Por Status</h3>
              <button className="btn btn-secondary" onClick={exportOrdersCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> CSV
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Qtd</th>
                  <th>%</th>
                  <th>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {statusReport.map((s) => (
                  <tr key={s.status}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s.status], display: 'inline-block' }} />
                        {s.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.count}</td>
                    <td>{s.pct}%</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Por Pagamento</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>Pedidos</th>
                  <th>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {paymentReport.map((p) => (
                  <tr key={p.method}>
                    <td style={{ fontWeight: 500 }}>{p.method}</td>
                    <td>{p.count}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(p.total)}</td>
                  </tr>
                ))}
                {paymentReport.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>Sem dados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Financial */}
      {tab === 'financial' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)' }}>
              <h4 style={{ color: '#065f46' }}>Receita Total</h4>
              <div className="value" style={{ color: '#065f46', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalGross)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)' }}>
              <h4 style={{ color: '#5b21b6' }}>Subtotal Produtos</h4>
              <div className="value" style={{ color: '#5b21b6', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalSubtotal)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #0ea5e9 100%)' }}>
              <h4 style={{ color: '#0c4a6e' }}>Total Frete</h4>
              <div className="value" style={{ color: '#0c4a6e', fontSize: '1.4rem' }}>{formatCurrency(financialReport.totalDelivery)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)' }}>
              <h4 style={{ color: '#92400e' }}>Ticket Medio</h4>
              <div className="value" style={{ color: '#92400e', fontSize: '1.4rem' }}>{formatCurrency(financialReport.avgTicket)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Resumo Financeiro</h3>
              <button className="btn btn-secondary" onClick={exportFinancialCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> Exportar CSV
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Metrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Pedidos Entregues</td><td style={{ fontWeight: 600 }}>{financialReport.deliveredCount}</td></tr>
                <tr><td>Pedidos Cancelados</td><td style={{ fontWeight: 600, color: 'var(--danger)' }}>{financialReport.cancelledCount}</td></tr>
                <tr><td>Receita Total (Entregues)</td><td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(financialReport.totalGross)}</td></tr>
                <tr><td>Subtotal Produtos</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.totalSubtotal)}</td></tr>
                <tr><td>Total Frete Cobrado</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.totalDelivery)}</td></tr>
                <tr><td>Total Descontos</td><td style={{ fontWeight: 600, color: 'var(--danger)' }}>-{formatCurrency(financialReport.totalDiscount)}</td></tr>
                <tr style={{ background: '#f0fdf4' }}><td style={{ fontWeight: 700 }}>Ticket Medio</td><td style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>{formatCurrency(financialReport.avgTicket)}</td></tr>
                <tr><td>Frete Medio por Pedido</td><td style={{ fontWeight: 600 }}>{formatCurrency(financialReport.avgDelivery)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {tab === 'products' && (
        <div className="card">
          <div className="card-header">
            <h3><Package size={20} style={{ marginRight: '0.5rem' }} /> Produtos Mais Vendidos</h3>
            <button className="btn btn-secondary" onClick={exportProductsCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          {productReport.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Nenhum produto vendido no periodo</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Unidades Vendidas</th>
                  <th>Pedidos</th>
                  <th>Receita</th>
                </tr>
              </thead>
              <tbody>
                {productReport.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.quantity}</td>
                    <td>{p.orders}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Hourly */}
      {tab === 'hourly' && (
        <div className="card">
          <div className="card-header">
            <h3><Clock size={20} style={{ marginRight: '0.5rem' }} /> Pedidos por Horario</h3>
            <button className="btn btn-secondary" onClick={exportHourlyCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {hourlyReport.map((h) => (
              <div key={h.hour} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '40px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>
                  {h.label}
                </span>
                <div style={{ flex: 1, height: '20px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(h.count / maxHourlyCount) * 100}%`,
                    height: '100%',
                    background: h.count > 0 ? 'var(--primary)' : 'transparent',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ width: '30px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}>
                  {h.count}
                </span>
                <span style={{ width: '90px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>
                  {h.revenue > 0 ? formatCurrency(h.revenue) : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
