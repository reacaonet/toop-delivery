import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, History, Car, Navigation, Clock, X, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'
import { orderService, settingsService, deliverymanService, bookingService } from '../api'

interface Order {
  _id: string
  orderNumber: string | number
  status: string
  total: number
  deliveryFee?: number
  store?: { name: string }
  deliveryman?: string | { _id: string }
  createdAt: string
}

interface RideRequest {
  _id: string
  bookingNumber: string
  serviceCategory: string
  pickup: { address: string; lat: number; lng: number }
  dropoff: { address: string; lat: number; lng: number }
  distance: number
  estimatedPrice: number
  client?: { name: string; phone?: string }
  notes?: string
}

const ACCEPT_TIMEOUT = 15

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(user?.deliveryman?.available ?? true)
  const [togglingAvailability, setTogglingAvailability] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dmFeePct, setDmFeePct] = useState(2)

  // Driver mode state
  const [isDriver, setIsDriver] = useState(false)
  const [driverOnline, setDriverOnline] = useState(false)
  const [driverAvailable, setDriverAvailable] = useState(false)
  const [togglingDriver, setTogglingDriver] = useState(false)

  // Ride request popup
  const [pendingRide, setPendingRide] = useState<RideRequest | null>(null)
  const [acceptTimer, setAcceptTimer] = useState(ACCEPT_TIMEOUT)
  const [accepting, setAccepting] = useState(false)
  const [rideQueue, setRideQueue] = useState<RideRequest[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const pendingRideRef = useRef<RideRequest | null>(null)

  useEffect(() => {
    pendingRideRef.current = pendingRide
  }, [pendingRide])

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders()
      const orderList = Array.isArray(data) ? data : []
      const dmId = user?.deliveryman?._id
      const myOrders = orderList.filter((o: Order) => {
        const dm = o.deliveryman
        if (!dm) return false
        const orderDmId = typeof dm === 'string' ? dm : (dm as any)._id
        return orderDmId === dmId && ['ready', 'delivering', 'delivered'].includes(o.status)
      })
      setOrders(myOrders)
    } catch {}
    finally { setLoading(false) }
  }, [user?.deliveryman?._id])

  const fetchPendingRides = useCallback(async () => {
    if (!isDriver || !driverOnline || !driverAvailable) return
    try {
      const result = await bookingService.getBookings({ status: 'matching' })
      const rides: RideRequest[] = Array.isArray(result) ? result : (result?.data || [])
      setRideQueue(rides)
      if (!pendingRide && rides.length > 0) {
        setPendingRide(rides[0])
        setAcceptTimer(ACCEPT_TIMEOUT)
      }
    } catch {}
  }, [isDriver, driverOnline, driverAvailable, pendingRide])

  const loadProfile = useCallback(async () => {
    try {
      const profile = await deliverymanService.getProfile()
      if (profile) {
        setIsDriver(profile.isDriver || false)
        setDriverOnline(profile.driverOnline || false)
        setDriverAvailable(profile.driverAvailable || false)
        setIsOnline(profile.available ?? true)
      }
    } catch {}
  }, [])

  // Socket.io connection for real-time ride requests
  useEffect(() => {
    if (!isDriver || !driverOnline || !driverAvailable) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = window.location.port === '4204'
      ? 'http://localhost:8100'
      : window.location.origin
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Socket] Conectado para receber corridas')
    })

    socket.on('booking:ride_request', (data: any) => {
      console.log('[Socket] Nova corrida recebida:', data)
      const rideRequest: RideRequest = {
        _id: data.bookingId,
        bookingNumber: data.bookingNumber,
        serviceCategory: data.serviceCategory,
        pickup: data.pickup,
        dropoff: data.dropoff,
        distance: data.distance,
        estimatedPrice: data.estimatedPrice,
        notes: data.notes,
      }
      if (!pendingRideRef.current) {
        setPendingRide(rideRequest)
        setAcceptTimer(ACCEPT_TIMEOUT)
      } else {
        setRideQueue(prev => [...prev, rideRequest])
      }
    })

    socket.on('booking:cancelled', (data: any) => {
      setRideQueue(prev => prev.filter(r => r._id !== data.bookingId))
      if (pendingRideRef.current?._id === data.bookingId) {
        dismissRide()
      }
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Desconectado')
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isDriver, driverOnline, driverAvailable])

  // Watch location while driver online
  useEffect(() => {
    if (!isDriver || !driverOnline) return
    let watchId: number | null = null
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          deliverymanService.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {})
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      )
    }
    return () => { if (watchId != null) navigator.geolocation.clearWatch(watchId) }
  }, [isDriver, driverOnline])

  useEffect(() => {
    loadProfile()
    fetchOrders()
    fetchPendingRides()
    const orderInterval = setInterval(fetchOrders, 15000)
    const rideInterval = setInterval(fetchPendingRides, 4000)
    settingsService.getSettings().then(s => {
      if (s?.deliverymanFeePercentage != null) setDmFeePct(s.deliverymanFeePercentage)
    }).catch(() => {})
    return () => {
      clearInterval(orderInterval)
      clearInterval(rideInterval)
    }
  }, [fetchOrders, fetchPendingRides, loadProfile])

  // Countdown timer for accept
  useEffect(() => {
    if (pendingRide && acceptTimer > 0) {
      timerRef.current = setInterval(() => {
        setAcceptTimer(prev => {
          if (prev <= 1) {
            dismissRide()
            return ACCEPT_TIMEOUT
          }
          return prev - 1
        })
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [pendingRide])

  const dismissRide = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPendingRide(null)
    setAcceptTimer(ACCEPT_TIMEOUT)
    setRideQueue(prev => prev.slice(1))
  }

  const handleAcceptRide = async () => {
    if (!pendingRide) return
    setAccepting(true)
    try {
      await bookingService.acceptBooking(pendingRide._id)
      if (timerRef.current) clearInterval(timerRef.current)
      setPendingRide(null)
      setRideQueue(prev => prev.slice(1))
      navigate('/active-ride')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao aceitar corrida')
    } finally {
      setAccepting(false)
    }
  }

  const handleRejectRide = async () => {
    if (!pendingRide) return
    try { await bookingService.rejectBooking(pendingRide._id) } catch {}
    dismissRide()
  }

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true)
    try {
      const result = await deliverymanService.toggleAvailability()
      setIsOnline(result.available)
    } catch { alert('Erro ao alterar disponibilidade') }
    finally { setTogglingAvailability(false) }
  }

  const handleToggleDriverMode = async () => {
    setTogglingDriver(true)
    try {
      const result = await deliverymanService.toggleDriverMode()
      setIsDriver(result.isDriver)
      setDriverOnline(result.driverOnline)
      setDriverAvailable(result.driverAvailable)
    } catch { alert('Erro ao alterar modo motorista') }
    finally { setTogglingDriver(false) }
  }

  const handleToggleDriverOnline = async () => {
    setTogglingDriver(true)
    try {
      let lat: number | undefined
      let lng: number | undefined
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {}
      const result = await deliverymanService.toggleDriverOnline(lat, lng)
      setDriverOnline(result.driverOnline)
      setDriverAvailable(result.driverAvailable)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao alterar status')
    } finally { setTogglingDriver(false) }
  }

  const handleToggleDriverAvailable = async () => {
    setTogglingDriver(true)
    try {
      const result = await deliverymanService.toggleDriverAvailable()
      setDriverOnline(result.driverOnline)
      setDriverAvailable(result.driverAvailable)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao alterar disponibilidade')
    } finally { setTogglingDriver(false) }
  }

  const availableCount = orders.filter(o => o.status === 'ready').length
  const activeDelivery = orders.find(o => o.status === 'delivering')
  const todayDeliveries = orders.filter(o => o.status === 'delivered').length
  const todayEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.deliveryFee || 0) * (1 - dmFeePct / 100), 0)

  const timerPercent = (acceptTimer / ACCEPT_TIMEOUT) * 100

  return (
    <div className="dashboard-page">
      {/* RIDE REQUEST POPUP */}
      {pendingRide && (
        <div className="ride-popup-overlay">
          <div className="ride-popup">
            <div className="ride-popup-timer">
              <div className="ride-popup-timer-bar" style={{ width: `${timerPercent}%` }} />
            </div>
            <div className="ride-popup-header">
              <div className="ride-popup-type">
                <span className="ride-popup-type-icon">
                  {pendingRide.serviceCategory === 'driver' ? '🚗' : pendingRide.serviceCategory === 'delivery' ? '📦' : '📮'}
                </span>
                <div>
                  <span className="ride-popup-type-label">
                    {pendingRide.serviceCategory === 'driver' ? 'Corrida' : pendingRide.serviceCategory === 'delivery' ? 'Entrega' : 'Pacote'}
                  </span>
                  <span className="ride-popup-number">#{pendingRide.bookingNumber}</span>
                </div>
              </div>
              <span className="ride-popup-timer-text">{acceptTimer}s</span>
            </div>
            <div className="ride-popup-route">
              <div className="ride-popup-point">
                <div className="ride-popup-dot green" />
                <div className="ride-popup-point-info">
                  <span className="ride-popup-point-label">ORIGEM</span>
                  <span className="ride-popup-point-address">{pendingRide.pickup?.address}</span>
                </div>
              </div>
              <div className="ride-popup-route-line" />
              <div className="ride-popup-point">
                <div className="ride-popup-dot red" />
                <div className="ride-popup-point-info">
                  <span className="ride-popup-point-label">DESTINO</span>
                  <span className="ride-popup-point-address">{pendingRide.dropoff?.address}</span>
                </div>
              </div>
            </div>
            <div className="ride-popup-info">
              <div className="ride-popup-info-item">
                <Navigation size={14} />
                <span>{pendingRide.distance?.toFixed(1) || '-'} km</span>
              </div>
              <div className="ride-popup-info-item price">
                <span>R$ {(pendingRide.estimatedPrice || 0).toFixed(2)}</span>
              </div>
            </div>
            {pendingRide.notes && (
              <div className="ride-popup-notes"><span>📝</span> {pendingRide.notes}</div>
            )}
            <div className="ride-popup-actions">
              <button className="ride-popup-btn reject" onClick={handleRejectRide} disabled={accepting}>
                <X size={20} /> Recusar
              </button>
              <button className="ride-popup-btn accept" onClick={handleAcceptRide} disabled={accepting}>
                <Check size={20} /> {accepting ? 'Aceitando...' : 'Aceitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>Olá, {user?.name || user?.email}</h2>

      {/* DELIVERY MODE */}
      <div className="status-toggle">
        <div className="status-toggle-label">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
          <span>{isOnline ? 'Entrega Disponível' : 'Entrega Offline'}</span>
        </div>
        <button
          className={`toggle-switch ${isOnline ? 'active' : ''}`}
          onClick={handleToggleAvailability}
          disabled={togglingAvailability}
        >
          <div className="toggle-switch-handle" />
        </button>
      </div>

      {/* DRIVER MODE */}
      <div className="driver-mode-section">
        <div className="driver-mode-header">
          <Car size={20} />
          <span className="driver-mode-title">Modo Motorista</span>
          <button
            className={`driver-mode-toggle ${isDriver ? 'active' : ''}`}
            onClick={handleToggleDriverMode}
            disabled={togglingDriver}
          >
            {isDriver ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>

        {isDriver && (
          <div className="driver-mode-controls">
            <div className="driver-status-row">
              <span>Online</span>
              <button
                className={`mini-toggle ${driverOnline ? 'active' : ''}`}
                onClick={handleToggleDriverOnline}
                disabled={togglingDriver}
              >
                {driverOnline ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="driver-status-row">
              <span>Disponível para corridas</span>
              <button
                className={`mini-toggle ${driverAvailable ? 'active' : ''}`}
                onClick={handleToggleDriverAvailable}
                disabled={togglingDriver || !driverOnline}
              >
                {driverAvailable ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
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
          <span className="stat-value">{rideQueue.length}</span>
          <span className="stat-label">Corridas na Fila</span>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => navigate('/available')}>
          <Package size={32} />
          <span>Pedidos</span>
          {availableCount > 0 && <span className="badge">{availableCount}</span>}
        </div>
        <div className="quick-action-card" onClick={() => navigate('/active')}>
          <Truck size={32} />
          <span>Entrega</span>
          {activeDelivery && <span className="badge">1</span>}
        </div>
        <div className="quick-action-card" onClick={() => navigate('/available-rides')}>
          <Car size={32} />
          <span>Corridas</span>
          {rideQueue.length > 0 && <span className="badge">{rideQueue.length}</span>}
        </div>
        <div className="quick-action-card" onClick={() => navigate('/history')}>
          <History size={32} />
          <span>Histórico</span>
        </div>
      </div>

      {loading && <div className="loading" style={{ padding: '20px' }}><div className="spinner" /></div>}
    </div>
  )
}

export default DashboardPage
