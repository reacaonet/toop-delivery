import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Clock, User, Hash } from 'lucide-react'
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

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: number
  status: string
  total: number
  subtotal?: number
  deliveryFee?: number
  createdAt: string
  customer?: { name?: string } | null
  items?: OrderItem[]
  address?: { street?: string; number?: string }
}

const OrdersPage = () => {
  const { companyId } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (companyId) loadOrders()
  }, [companyId])

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders', { params: { company: companyId } })
      const data = res.data?.data ?? res.data
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + (err.response?.data?.error || err.message))
    }
  }

  const getNextAction = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Confirmar', next: 'confirmed', className: 'btn-primary' }
      case 'confirmed':
        return { label: 'Preparar', next: 'preparing', className: 'btn-warning' }
      case 'preparing':
        return { label: 'Pronto', next: 'ready', className: 'btn-success' }
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
      <div className="card">
        <div className="card-header">
          <h3>
            <ShoppingCart size={20} />
            Pedidos
          </h3>
          <button className="btn btn-secondary" onClick={loadOrders}>
            Atualizar
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">Nenhum pedido encontrado</div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => {
              const expanded = expandedId === order._id
              const action = getNextAction(order.status)

              return (
                <div key={order._id} className="order-card">
                  <div
                    className="order-card-header"
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                  >
                    <div className="order-card-title">
                      <Hash size={16} />
                      <span className="order-number">#{order.orderNumber}</span>
                    </div>
                    <div className="order-card-actions">
                      <span
                        className="badge"
                        style={{ background: STATUS_COLOR[order.status] || '#6b7280' }}
                      >
                        {STATUS_MAP[order.status] || order.status}
                      </span>
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  <div className="order-card-summary">
                    <div className="order-card-info">
                      <User size={14} />
                      <span>{order.customer?.name || 'Cliente'}</span>
                    </div>
                    <span className="order-card-total">R$ {Number(order.total || 0).toFixed(2)}</span>
                  </div>

                  {expanded && (
                    <div className="order-card-details">
                      <div className="order-detail-row">
                        <Clock size={14} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>

                      {order.address && (
                        <div className="order-detail-row">
                          <span className="detail-label">Endereco:</span>
                          <span>{order.address.street}, {order.address.number}</span>
                        </div>
                      )}

                      {order.items && order.items.length > 0 && (
                        <div className="order-items">
                          <span className="detail-label">Itens:</span>
                          {order.items.map((item, i) => (
                            <div key={i} className="order-item-row">
                              <span>{item.quantity}x {item.name}</span>
                              <span>R$ {Number(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="order-totals">
                        {order.subtotal != null && (
                          <div className="total-row">
                            <span>Subtotal</span>
                            <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                          </div>
                        )}
                        {order.deliveryFee != null && (
                          <div className="total-row">
                            <span>Taxa de Entrega</span>
                            <span>R$ {Number(order.deliveryFee).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="total-row total-final">
                          <span>Total</span>
                          <span>R$ {Number(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {action && (
                        <div className="order-status-actions">
                          <button
                            className={`btn ${action.className}`}
                            onClick={() => updateStatus(order._id, action.next)}
                          >
                            {action.label}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
