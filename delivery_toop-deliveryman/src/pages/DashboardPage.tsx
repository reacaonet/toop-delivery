import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, History, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { orderService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  storeName?: string
  store?: { name: string }
  deliveryAddress?: string
  address?: string
  deliverymanId?: string
  createdAt: string
  [key: string]: unknown
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders()
      const orderList = Array.isArray(data) ? data : []
      const myOrders = orderList.filter(
        (o: Order) =>
          o.deliverymanId === user?._id &&
          (o.status === 'ready' || o.status === 'delivering')
      )
      setOrders(myOrders)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const availableCount = orders.filter((o) => o.status === 'ready').length
  const activeDelivery = orders.find((o) => o.status === 'delivering')
  const todayDeliveries = orders.filter((o) => o.status === 'delivered').length

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
          <span className="stat-value">R$ 0</span>
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
