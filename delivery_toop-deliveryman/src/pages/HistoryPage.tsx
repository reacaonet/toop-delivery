import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { orderService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  storeName?: string
  store?: { name: string }
  deliverymanId?: string
  createdAt: string
  [key: string]: unknown
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const data = await orderService.getOrders()
      const orderList = Array.isArray(data) ? data : []
      const myHistory = orderList
        .filter(
          (o: Order) =>
            o.deliverymanId === user?._id &&
            (o.status === 'delivered' || o.status === 'cancelled')
        )
        .sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      setOrders(myHistory)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const totalDeliveries = orders.filter((o) => o.status === 'delivered').length
  const totalEarnings = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
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
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Histórico</h2>
      </div>

      <div className="history-stats">
        <div className="history-stat">
          <span className="stat-value">{totalDeliveries}</span>
          <span className="stat-label">Total Entregas</span>
        </div>
        <div className="history-stat">
          <span className="stat-value">R$ {totalEarnings.toFixed(2)}</span>
          <span className="stat-label">Total Ganhos</span>
        </div>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <History size={48} />
          <p>Nenhuma entrega no histórico</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className={`history-card`}
          >
            <div className="history-card-left">
              <div className="order-number">Pedido #{order.orderNumber}</div>
              <div className="order-store">
                {order.storeName || order.store?.name || 'Loja'}
              </div>
              <div className="order-date">{formatDate(order.createdAt)}</div>
            </div>
            <div className="history-card-right">
              <span className="order-value">R$ {(order.total || 0).toFixed(2)}</span>
              <span className={`status-badge ${order.status}`}>
                {order.status === 'delivered' ? (
                  <CheckCircle size={12} style={{ marginRight: 4 }} />
                ) : (
                  <XCircle size={12} style={{ marginRight: 4 }} />
                )}
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default HistoryPage
