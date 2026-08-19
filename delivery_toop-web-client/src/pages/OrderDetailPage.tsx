import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

interface Order {
  _id: string
  orderNumber: number
  createdAt: string
  total: number
  subtotal: number
  deliveryFee: number
  discount: number
  status: string
  paymentMethod: string
  notes: string
  items: Array<{ name: string; quantity: number; price: number; total: number }>
  deliveryAddress: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
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

const statusSteps = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']

const paymentLabels: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  cash: 'Dinheiro',
}

const paymentIcons: Record<string, string> = {
  credit_card: '💳',
  debit_card: '💳',
  pix: '⚡',
  cash: '💵',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.data)
      } catch {
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  if (loading) return <div className="loading">Carregando pedido...</div>
  if (!order) return <div className="empty-state">Pedido não encontrado</div>

  const currentStepIndex = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/orders')}>
        ← Meus Pedidos
      </button>

      <div className="order-detail">
        <div className="order-detail-header">
          <h1>Pedido #{order.orderNumber}</h1>
          <span className={`status-badge large status-${order.status}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>

        <p className="order-date">
          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {!isCancelled && currentStepIndex >= 0 && (
          <div className="status-timeline">
            {statusSteps.map((step, index) => (
              <div
                key={step}
                className={`timeline-step ${index <= currentStepIndex ? 'completed' : ''} ${
                  index === currentStepIndex ? 'current' : ''
                }`}
              >
                <div className="timeline-dot" />
                <span className="timeline-label">{statusLabels[step]}</span>
                {index < statusSteps.length - 1 && <div className="timeline-line" />}
              </div>
            ))}
          </div>
        )}

        <section className="order-section">
          <h2>Itens</h2>
          <div className="order-items">
            {order.items.map((item, i) => (
              <div key={i} className="order-item">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="order-section">
          <h2>Resumo</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>R$ {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Frete</span>
            <span>
              {order.deliveryFee > 0 ? `R$ ${order.deliveryFee.toFixed(2)}` : 'Grátis'}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="cart-summary-row discount">
              <span>Desconto</span>
              <span>- R$ {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>R$ {order.total.toFixed(2)}</span>
          </div>
        </section>

        <section className="order-section">
          <h2>Pagamento</h2>
          <p>
            <span style={{ marginRight: '8px' }}>{paymentIcons[order.paymentMethod] || '💰'}</span>
            {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </section>

        <section className="order-section">
          <h2>Endereço de Entrega</h2>
          <p>
            {order.deliveryAddress.street}, {order.deliveryAddress.number}
            {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
          </p>
          <p>
            {order.deliveryAddress.neighborhood} - {order.deliveryAddress.city}/{order.deliveryAddress.state}
          </p>
          <p>CEP: {order.deliveryAddress.zipCode}</p>
        </section>

        {order.notes && (
          <section className="order-section">
            <h2>Observações</h2>
            <p>{order.notes}</p>
          </section>
        )}
      </div>
    </div>
  )
}
