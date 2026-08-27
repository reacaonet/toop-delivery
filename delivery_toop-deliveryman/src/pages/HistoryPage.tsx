import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, ArrowLeft, CheckCircle, XCircle, Car, Package, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { orderService, bookingService, walletService, settingsService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  deliveryFee?: number
  storeName?: string
  store?: { name: string }
  deliveryman?: string | { _id: string; name?: string }
  customer?: { name?: string }
  deliveryAddress?: string | { street?: string; number?: string; neighborhood?: string; city?: string }
  createdAt: string
  [key: string]: unknown
}

interface Booking {
  _id: string
  bookingNumber: string
  status: string
  serviceCategory: string
  pickup: { address: string }
  dropoff: { address: string }
  distance?: number
  estimatedPrice?: number
  finalPrice?: number
  createdAt: string
  rating?: { driver?: number; client?: number; driverComment?: string }
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'rides' | 'deliveries'>('rides')
  const [orders, setOrders] = useState<Order[]>([])
  const [rides, setRides] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [dmFeePct, setDmFeePct] = useState(2)
  const [walletBalance, setWalletBalance] = useState({ balance: 0, totalEarnings: 0, totalWithdrawals: 0 })
  const [ratingFor, setRatingFor] = useState<string | null>(null)
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSaving, setRatingSaving] = useState(false)
  const [ratingMsg, setRatingMsg] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      const [orderData, rideData, walletData] = await Promise.allSettled([
        orderService.getOrders(),
        bookingService.getBookings({ status: 'completed' }),
        walletService.getBalance(),
      ])

      if (orderData.status === 'fulfilled') {
        const orderList = Array.isArray(orderData.value) ? orderData.value : []
        const dmId = user?.deliveryman?._id
        const myHistory = orderList
          .filter((o: Order) => {
            const dm = o.deliveryman
            if (!dm) return false
            const orderDmId = typeof dm === 'string' ? dm : (dm as any)._id
            return orderDmId === dmId && (o.status === 'delivered' || o.status === 'cancelled')
          })
          .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(myHistory)
      }

      if (rideData.status === 'fulfilled') {
        const rideList = Array.isArray(rideData.value?.data) ? rideData.value.data :
                         Array.isArray(rideData.value) ? rideData.value : []
        setRides(rideList)
      }

      if (walletData.status === 'fulfilled') {
        setWalletBalance(walletData.value || { balance: 0, totalEarnings: 0, totalWithdrawals: 0 })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [user?.deliveryman?._id])

  useEffect(() => {
    fetchHistory()
    settingsService.getSettings().then(s => { if (s?.deliverymanFeePercentage != null) setDmFeePct(s.deliverymanFeePercentage) }).catch(() => {})
  }, [fetchHistory])

  const totalDeliveries = orders.filter(o => o.status === 'delivered').length
  const totalDeliveryEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.deliveryFee || 0) * (1 - dmFeePct / 100), 0)

  const totalRides = rides.length
  const totalRideEarnings = rides.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      completed: 'Concluída',
    }
    return labels[status] || status
  }

  const getServiceIcon = (cat: string) => {
    if (cat === 'driver') return <Car size={16} />
    if (cat === 'delivery') return <Package size={16} />
    return <Package size={16} />
  }

  const submitRating = async () => {
    if (!ratingFor || ratingStars < 1) return
    setRatingSaving(true)
    setRatingMsg(null)
    try {
      await bookingService.rateBooking(ratingFor, ratingStars, ratingComment, 'driver')
      setRides(prev => prev.map(r => r._id === ratingFor ? { ...r, rating: { driver: ratingStars, driverComment: ratingComment } } : r))
      setRatingFor(null)
      setRatingStars(0)
      setRatingComment('')
      setRatingMsg('Avaliação enviada!')
      setTimeout(() => setRatingMsg(null), 2500)
    } catch (error: any) {
      setRatingMsg('Erro ao enviar avaliação: ' + (error.response?.data?.error || 'tente novamente'))
      setTimeout(() => setRatingMsg(null), 3000)
    } finally {
      setRatingSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Histórico</h2>
      </div>

      {/* Wallet summary */}
      <div className="history-stats">
        <div className="history-stat">
          <span className="stat-value">R$ {walletBalance.balance.toFixed(2)}</span>
          <span className="stat-label">Saldo Wallet</span>
        </div>
        <div className="history-stat">
          <span className="stat-value">R$ {walletBalance.totalEarnings.toFixed(2)}</span>
          <span className="stat-label">Total Ganhos</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'rides' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('rides')}
        >
          <Car size={14} /> Corridas ({totalRides})
        </button>
        <button
          className={`btn ${tab === 'deliveries' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('deliveries')}
        >
          <Package size={14} /> Entregas ({totalDeliveries})
        </button>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: 40 }}><div className="spinner" /></div>
      ) : tab === 'rides' ? (
        rides.length === 0 ? (
          <div className="empty-state">
            <Car size={48} />
            <p>Nenhuma corrida no histórico</p>
          </div>
        ) : (
          rides.map(ride => (
            <div key={ride._id} className="history-card">
              <div className="history-card-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {getServiceIcon(ride.serviceCategory)}
                  <span className="order-number">#{ride.bookingNumber}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#666' }}>
                  <MapPin size={12} color="#10b981" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {ride.pickup?.address}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#666' }}>
                  <MapPin size={12} color="#ef4444" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {ride.dropoff?.address}
                  </span>
                </div>
                <div className="order-date">{formatDate(ride.createdAt)} · {ride.distance?.toFixed(1) || '-'} km</div>
              </div>
              <div className="history-card-right">
                <span className="order-value">R$ {(ride.finalPrice || ride.estimatedPrice || 0).toFixed(2)}</span>
                <span className={`status-badge ${ride.status}`}>
                  {ride.status === 'completed' ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : <XCircle size={12} style={{ marginRight: 4 }} />}
                  {getStatusLabel(ride.status)}
                </span>
                {ride.status === 'completed' && !ride.rating?.driver && (
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 6, width: '100%' }} onClick={() => { setRatingFor(ride._id); setRatingStars(0); setRatingComment('') }}>
                    Avaliar passageiro
                  </button>
                )}
                {ride.status === 'completed' && ride.rating?.driver && (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 6 }}>
                    {'★'.repeat(ride.rating.driver)}{'☆'.repeat(5 - ride.rating.driver)}
                  </span>
                )}
              </div>
            </div>
          ))
        )
      ) : (
        orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>Nenhuma entrega no histórico</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="history-card">
              <div className="history-card-left">
                <div className="order-number">Pedido #{order.orderNumber}</div>
                <div className="order-store">{order.storeName || order.store?.name || 'Loja'}</div>
                <div className="order-date">{formatDate(order.createdAt)}</div>
              </div>
              <div className="history-card-right">
                <span className="order-value">R$ {((order.deliveryFee || 0) * (1 - dmFeePct / 100)).toFixed(2)}</span>
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'delivered' ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : <XCircle size={12} style={{ marginRight: 4 }} />}
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          ))
        )
      )}

      {/* Rating modal */}
      {ratingFor && (
        <div className="rating-overlay" onClick={() => setRatingFor(null)}>
          <div className="rating-modal" onClick={e => e.stopPropagation()}>
            <h3>Avaliar passageiro</h3>
            <p>Como foi o passageiro nesta corrida?</p>
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  className={`rating-star ${s <= ratingStars ? 'active' : ''}`}
                  onClick={() => setRatingStars(s)}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              className="rating-comment-input"
              placeholder="Comentário (opcional)"
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
            />
            {ratingMsg && <div className="rating-msg">{ratingMsg}</div>}
            <div className="rating-actions">
              <button className="btn btn-outline" onClick={() => setRatingFor(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={ratingSaving || ratingStars < 1}>
                {ratingSaving ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
