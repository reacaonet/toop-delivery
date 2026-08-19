import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, MapPin, Store, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { orderService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  storeName?: string
  store?: { name: string }
  customerName?: string
  customer?: { name: string }
  deliveryAddress?: string
  address?: string
  items?: Array<{ name: string; quantity: number; price: number }>
  [key: string]: unknown
}

const AvailableOrdersPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders({ status: 'ready' })
      const orderList = Array.isArray(data) ? data : []
      setOrders(orderList)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleAccept = async (orderId: string) => {
    if (!user?._id) return
    setAcceptingId(orderId)
    try {
      await orderService.updateOrderStatus(orderId, 'delivering', user._id)
      navigate('/active')
    } catch {
      alert('Erro ao aceitar entrega')
    } finally {
      setAcceptingId(null)
    }
  }

  const getStoreName = (order: Order) => {
    return order.storeName || order.store?.name || 'Loja'
  }

  const getAddress = (order: Order) => {
    return order.deliveryAddress || order.address || 'Endereço não informado'
  }

  const getCustomerName = (order: Order) => {
    return order.customerName || order.customer?.name || 'Cliente'
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pedidos Disponíveis</h2>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>Nenhum pedido disponível no momento</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <div className="order-number">
                  Pedido #{order.orderNumber}
                </div>
                <div className="order-store">
                  <Store size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {getStoreName(order)}
                </div>
              </div>
              <div className="order-value">
                R$ {(order.total || 0).toFixed(2)}
              </div>
            </div>

            <div className="order-addresses">
              <div className="order-address-row">
                <MapPin size={16} />
                <div>
                  <div className="address-label">Entregar para</div>
                  <div className="address-text">
                    {getCustomerName(order)} - {getAddress(order)}
                  </div>
                </div>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="order-items">
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}: {' '}
                {order.items.map((item) => item.name).join(', ')}
              </div>
            )}

            <div className="order-actions">
              <button
                className="btn btn-success"
                onClick={() => handleAccept(order._id)}
                disabled={acceptingId === order._id}
              >
                {acceptingId === order._id ? 'Aceitando...' : 'Aceitar Entrega'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default AvailableOrdersPage
