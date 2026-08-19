import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

interface Order {
  _id: string
  orderNumber: number
  createdAt: string
  total: number
  status: string
  items: Array<{ name: string; quantity: number; price: number; total: number }>
  company: { name: string } | string
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  delivering: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const { data } = await api.get('/orders', { params: { customer: user!._id } })
        const ordersPaginated = data.data
        setOrders(Array.isArray(ordersPaginated) ? ordersPaginated : ordersPaginated?.data ?? [])
      } catch {
        // handle silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return <div className="loading">Carregando pedidos...</div>

  return (
    <div className="page">
      <h1 className="page-title">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>Nenhum pedido ainda</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Fazer primeiro pedido
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="order-card-header">
                <span className="order-number">Pedido #{order.orderNumber}</span>
                <span className={`status-badge status-${order.status}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="order-card-body">
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="order-items-summary">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </p>
              </div>
              <div className="order-card-footer">
                <span className="order-total">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
