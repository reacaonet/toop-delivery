import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, MapPin, ArrowLeft, CheckCircle } from 'lucide-react'
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
  customerPhone?: string
  customer?: { name: string; phone?: string }
  deliveryAddress?: string
  address?: string
  items?: Array<{ name: string; quantity: number; price: number }>
  [key: string]: unknown
}

const ActiveDeliveryPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [delivering, setDelivering] = useState(false)

  const fetchActiveDelivery = useCallback(async () => {
    try {
      const data = await orderService.getOrders({ status: 'delivering' })
      const orderList = Array.isArray(data) ? data : []
      const active = orderList.find(
        (o: Order) => o.deliverymanId === user?._id
      )
      setOrder(active || null)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    fetchActiveDelivery()
    const interval = setInterval(fetchActiveDelivery, 10000)
    return () => clearInterval(interval)
  }, [fetchActiveDelivery])

  const handleDelivered = async () => {
    if (!order?._id) return
    setDelivering(true)
    try {
      await orderService.updateOrderStatus(order._id, 'delivered')
      navigate('/')
    } catch {
      alert('Erro ao confirmar entrega')
    } finally {
      setDelivering(false)
    }
  }

  const getStoreName = (o: Order) => {
    return o.storeName || o.store?.name || 'Loja'
  }

  const getAddress = (o: Order) => {
    return o.deliveryAddress || o.address || 'Endereço não informado'
  }

  const getCustomerName = (o: Order) => {
    return o.customerName || o.customer?.name || 'Cliente'
  }

  const getCustomerPhone = (o: Order) => {
    return o.customerPhone || o.customer?.phone || ''
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
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Entrega Ativa</h2>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : !order ? (
        <div className="empty-state">
          <Truck size={48} />
          <p>Nenhuma entrega ativa no momento</p>
        </div>
      ) : (
        <div className="active-delivery-card">
          <div className="active-delivery-header">
            <h3>Pedido #{order.orderNumber}</h3>
            <p>{getStoreName(order)}</p>
          </div>
          <div className="active-delivery-body">
            <div className="customer-info">
              <div className="customer-avatar">
                {getCustomerName(order).charAt(0).toUpperCase()}
              </div>
              <div className="customer-details">
                <h4>{getCustomerName(order)}</h4>
                {getCustomerPhone(order) && (
                  <p>{getCustomerPhone(order)}</p>
                )}
              </div>
            </div>

            <div className="order-address-row" style={{ marginBottom: 12 }}>
              <MapPin size={16} />
              <div>
                <div className="address-label">Endereço de entrega</div>
                <div className="address-text">{getAddress(order)}</div>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="order-items">
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}: {' '}
                {order.items.map((item) => item.name).join(', ')}
              </div>
            )}

            <div className="order-card-header" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</span>
              <span className="order-value">
                R$ {(order.total || 0).toFixed(2)}
              </span>
            </div>

            <div className="map-placeholder" style={{ marginTop: 16 }}>
              <MapPin size={20} />
              Mapa (em breve)
            </div>

            <div className="delivery-actions">
              <div className="order-items" style={{ textAlign: 'center', background: '#fef3c7', border: '1px solid #fcd34d' }}>
                📱 Saiu para entrega
              </div>
              <button
                className="btn btn-success"
                onClick={handleDelivered}
                disabled={delivering}
              >
                <CheckCircle size={20} />
                {delivering ? 'Confirmando...' : 'Confirmar Entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveDeliveryPage
