import { useState, useEffect } from 'react'
import { ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em Preparo',
  ready: 'Pronto',
  delivering: 'A Caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#6366f1',
  preparing: '#f97316',
  ready: '#f97316',
  delivering: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

interface Order {
  _id: string
  orderNumber: number
  status: string
  total: number
  createdAt: string
  customer?: { name?: string } | null
  items?: Array<{ name: string; quantity: number; price: number }>
}

interface Product {
  _id: string
}

const DashboardPage = () => {
  const { companyId } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders', { params: { company: companyId } }),
        api.get(`/products/company/${companyId}`),
      ])

      const ordersData = ordersRes.data?.data ?? ordersRes.data
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      const productsData = productsRes.data?.data ?? productsRes.data
      const products = Array.isArray(productsData) ? productsData : Array.isArray(productsData?.data) ? productsData.data : []
      setProductCount(products.length)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  const stats = [
    { label: 'Total de Pedidos', value: orders.length, icon: ShoppingCart, color: '#EA1D2C' },
    { label: 'Pedidos Hoje', value: todayOrders.length, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#10b981' },
    { label: 'Produtos Cados', value: productCount, icon: Package, color: '#6366f1' },
  ]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="stats-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="stat-card">
              <div className="stat-card-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-card-content">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Pedidos Recentes</h3>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">Nenhum pedido encontrado</div>
        ) : (
          <div className="order-list">
            {orders.slice(0, 10).map((order) => (
              <div key={order._id} className="order-list-item">
                <div className="order-list-info">
                  <span className="order-number">#{order.orderNumber}</span>
                  <span className="order-customer">{order.customer?.name || 'Cliente'}</span>
                </div>
                <div className="order-list-meta">
                  <span
                    className="badge"
                    style={{ background: STATUS_COLOR[order.status] || '#6b7280' }}
                  >
                    {STATUS_MAP[order.status] || order.status}
                  </span>
                  <span className="order-total">R$ {Number(order.total || 0).toFixed(2)}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </span>
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
