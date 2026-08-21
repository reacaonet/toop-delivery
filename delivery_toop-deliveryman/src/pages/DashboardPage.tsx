import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, History, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { orderService, settingsService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  deliveryFee?: number
  storeName?: string
  store?: { name: string }
  deliveryman?: string | { _id: string; name?: string }
  deliveryAddress?: string | { street?: string; number?: string; neighborhood?: string; city?: string }
  createdAt: string
  [key: string]: unknown
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dmFeePct, setDmFeePct] = useState(2)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders()
      const orderList = Array.isArray(data) ? data : []
      const dmId = user?.deliveryman?._id
      const myOrders = orderList.filter(
        (o: Order) => {
          const dm = o.deliveryman
          if (!dm) return false
          const orderDmId = typeof dm === 'string' ? dm : (dm as any)._id
          return orderDmId === dmId && (o.status === 'ready' || o.status === 'delivering' || o.status === 'delivered')
        }
      )
      setOrders(myOrders)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [user?.deliveryman?._id])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    settingsService.getSettings().then(s => { if (s?.deliverymanFeePercentage != null) setDmFeePct(s.deliverymanFeePercentage) }).catch(() => {})
    return () => clearInterval(interval)
  }, [fetchOrders])

  const availableCount = orders.filter((o) => o.status === 'ready').length
  const activeDelivery = orders.find((o) => o.status === 'delivering')
  const todayDeliveries = orders.filter((o) => o.status === 'delivered').length

  const todayEarnings = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => {
      const fee = o.deliveryFee || 0;
      return sum + fee * (1 - dmFeePct / 100);
    }, 0)

  return (
    <div className="dashboard-page">
      <h2>Olá, {user?.name || user?.email}</h2>

      <div className="status-toggle">
        <div className="status-toggle-label">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
          <span>{isOnline ? 'Disponível' : 'Offline'}</span>
        </div>
        <button
          className={`toggle-switch ${isOnline ? 'active' : ''}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          <div className="toggle-switch-handle" />
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{todayDeliveries}</span>
          <span className="stat-label">Entregas Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">R$ {todayEarnings.toFixed(2)}</span>
          <span className="stat-label">Ganhos Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">-</span>
          <span className="stat-label">Avaliação</span>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => navigate('/available')}>
          <Package size={32} />
          <span>Pedidos Disponíveis</span>
          {availableCount > 0 && <span className="badge">{availableCount}</span>}
        </div>
        <div
          className="quick-action-card"
          onClick={() => navigate('/active')}
        >
          <Truck size={32} />
          <span>Entrega Ativa</span>
          {activeDelivery && <span className="badge">1</span>}
        </div>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: '20px' }}>
          <div className="spinner" />
        </div>
      ) : null}
    </div>
  )
}

export default DashboardPage
