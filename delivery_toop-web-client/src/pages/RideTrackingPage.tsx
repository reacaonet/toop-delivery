import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import api, { messageService } from '../api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendente',
  matching: 'Buscando motorista...',
  accepted: 'Motorista a caminho',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

const STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  matching: '🔍',
  accepted: '🚗',
  in_progress: '🛣️',
  completed: '✅',
  cancelled: '❌',
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatETA(distanceKm: number): string {
  const avgSpeedKmh = 30
  const minutes = Math.ceil((distanceKm / avgSpeedKmh) * 60)
  if (minutes < 1) return 'Menos de 1 min'
  if (minutes === 1) return '1 minuto'
  return `${minutes} minutos`
}

export default function RideTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [eta, setEta] = useState<string | null>(null)
  const [showQrVerify, setShowQrVerify] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [qrVerifying, setQrVerifying] = useState(false)
  const [qrResult, setQrResult] = useState<string | null>(null)

  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    loadBooking()
    const interval = setInterval(loadBooking, 4000)
    return () => clearInterval(interval)
  }, [id])

  const loadBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`)
      setBooking(data.data)
      setError('')
    } catch {
      setError('Corrida não encontrada')
    } finally {
      setLoading(false)
    }
  }

  // Socket.io connection for real-time updates — connect from matching onwards
  useEffect(() => {
    if (!id || !booking) return
    if (booking.status === 'completed' || booking.status === 'cancelled') return

    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = window.location.port === '4200'
      ? 'http://localhost:8100'
      : window.location.origin

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[RideTracking] Socket conectado')
    })

    socket.on('booking:driver_location', (data: any) => {
      if (data.bookingId === id && data.location) {
        setDriverLocation(data.location)
      }
    })

    socket.on('booking:accepted', (data: any) => {
      if (data.bookingId === id) loadBooking()
    })

    socket.on('booking:in_progress', (data: any) => {
      if (data.bookingId === id) loadBooking()
    })

    socket.on('booking:completed', (data: any) => {
      if (data.bookingId === id) {
        setDriverLocation(null)
        setEta(null)
        loadBooking()
      }
    })

    socket.on('booking:cancelled', (data: any) => {
      if (data.bookingId === id) {
        setDriverLocation(null)
        setEta(null)
        loadBooking()
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [id, booking?.status])

  // Initialize map when booking loads
  useEffect(() => {
    if (!booking || !mapRef.current || mapInstanceRef.current) return

    const pickup = booking.pickup
    const dropoff = booking.dropoff

    if (!pickup?.lat || !pickup?.lng || !dropoff?.lat || !dropoff?.lng) return

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    const pickupIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#22c55e;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">A</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map)

    const dropoffIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#ef4444;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">B</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map)

    L.polyline(
      [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
      { color: '#6366f1', weight: 5, opacity: 0.9 }
    ).addTo(map)

    const bounds = L.latLngBounds(
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng]
    )
    map.fitBounds(bounds, { padding: [60, 60] })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [booking])

  // Update driver marker on map
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return

    const map = mapInstanceRef.current

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng])
    } else {
      const driverIcon = L.divIcon({
        html: `<div style="width:40px;height:40px;border-radius:50%;background:#6366f1;border:4px solid #fff;box-shadow:0 2px 12px rgba(99,102,241,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">🚗</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
      driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
        .addTo(map)
    }

    if (booking?.status === 'accepted' && booking.pickup?.lat && booking.pickup?.lng) {
      const dist = haversineDistance(driverLocation.lat, driverLocation.lng, booking.pickup.lat, booking.pickup.lng)
      setEta(formatETA(dist))
      map.fitBounds(
        L.latLngBounds(
          [driverLocation.lat, driverLocation.lng],
          [booking.pickup.lat, booking.pickup.lng]
        ),
        { padding: [80, 80] }
      )
    } else if (booking?.status === 'in_progress' && booking.dropoff?.lat && booking.dropoff?.lng) {
      const dist = haversineDistance(driverLocation.lat, driverLocation.lng, booking.dropoff.lat, booking.dropoff.lng)
      setEta(formatETA(dist))
    }
  }, [driverLocation, booking])

  // Chat socket listener
  useEffect(() => {
    if (!showChat || !id || !socketRef.current) return
    const socket = socketRef.current

    socket.emit('chat:join_booking', { bookingId: id })

    const handleMessage = (data: any) => {
      if (data.bookingId === id) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message?._id)) return prev
          return [...prev, data.message]
        })
      }
    }
    socket.on('chat:new_message', handleMessage)

    return () => {
      socket.off('chat:new_message', handleMessage)
      socket.emit('chat:leave_booking', { bookingId: id })
    }
  }, [showChat, id])

  // Notification counter from socket events
  useEffect(() => {
    if (!id || !socketRef.current) return
    const socket = socketRef.current

    const onAccepted = (data: any) => {
      if (data.bookingId === id) setNotificationCount(c => c + 1)
    }
    const onCompleted = (data: any) => {
      if (data.bookingId === id) setNotificationCount(c => c + 1)
    }
    const onCancelled = (data: any) => {
      if (data.bookingId === id) setNotificationCount(c => c + 1)
    }

    socket.on('booking:accepted', onAccepted)
    socket.on('booking:completed', onCompleted)
    socket.on('booking:cancelled', onCancelled)

    return () => {
      socket.off('booking:accepted', onAccepted)
      socket.off('booking:completed', onCompleted)
      socket.off('booking:cancelled', onCancelled)
    }
  }, [id, booking?.status])

  // Load chat messages and unread count when opening
  useEffect(() => {
    if (!showChat || !id) return
    loadChatMessages()
    loadUnreadCount()
    messageService.markAsRead(id).catch(() => {})
    setNotificationCount(0)
  }, [showChat, id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatMessages = async () => {
    if (!id) return
    try {
      const result = await messageService.getMessages(id)
      const msgList = Array.isArray(result) ? result : (result?.data || [])
      setMessages(msgList)
    } catch {}
  }

  const loadUnreadCount = async () => {
    if (!id) return
    try {
      const result = await messageService.getUnreadCount(id)
      setUnreadCount(result?.unreadCount || 0)
    } catch {}
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !id) return
    const content = chatInput.trim()
    setChatInput('')
    try {
      await messageService.send(id, content)
    } catch {}
  }

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendChat()
    }
  }

  const openChat = () => {
    setShowChat(true)
    setUnreadCount(0)
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar?')) return
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelado pelo cliente', cancelledBy: 'client' })
      loadBooking()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar')
    }
  }

  const handleVerifyQR = async () => {
    if (!qrCode.trim() || !id) return
    setQrVerifying(true)
    setQrResult(null)
    try {
      await api.put(`/bookings/${id}/qr-verify`, { token: qrCode.trim() })
      setQrResult('success')
      loadBooking()
      setTimeout(() => setShowQrVerify(false), 2000)
    } catch (err: any) {
      setQrResult('error')
    } finally {
      setQrVerifying(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="page"><div className="alert-error">{error}</div><button className="btn-back" onClick={() => navigate('/')}>← Voltar</button></div>
  if (!booking) return null

  const isCancelled = booking.status === 'cancelled'
  const isCompleted = booking.status === 'completed'
  const isActive = ['matching', 'accepted', 'in_progress'].includes(booking.status)
  const showDriverTracking = ['accepted', 'in_progress'].includes(booking.status)

  return (
    <div className="track">
      {/* Map */}
      <div className="track-map-wrap">
        <button className="track-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        {showDriverTracking && (
          <button className="notification-bell-btn" onClick={() => setNotificationCount(0)}>
            🔔
            {notificationCount > 0 && <span className="notification-bell-badge">{notificationCount}</span>}
          </button>
        )}
        <div ref={mapRef} className="track-map" />
        {isActive && (
          <div className={`track-status-pill ${booking.status === 'matching' ? 'searching' : ''}`}>
            <span className={`track-status-dot ${booking.status === 'matching' ? 'amber' : ''}`} />
            {STATUS_MAP[booking.status]}
          </div>
        )}
        {showDriverTracking && driverLocation && eta && (
          <div className="track-eta-pill">
            <span style={{ fontSize: '16px' }}>🚗</span>
            <span>Motorista chega em <strong>{eta}</strong></span>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="track-panel">
        <div className="track-panel-header">
          <div>
            <h2 className="track-title">#{booking.bookingNumber}</h2>
            <span className={`track-badge track-badge-${booking.status}`}>
              {STATUS_ICONS[booking.status]} {STATUS_MAP[booking.status]}
            </span>
          </div>
        </div>

        {/* Uber/99-style step progress */}
        <div className="track-progress">
          <div className={`track-progress-step ${booking.status !== 'cancelled' ? 'done' : ''}`}>
            <div className="track-progress-dot" />
            <span>Solicitação enviada</span>
          </div>
          <div className={`track-progress-line ${booking.status === 'accepted' || booking.status === 'in_progress' || isCompleted ? 'active' : ''}`} />
          <div className={`track-progress-step ${booking.status === 'accepted' || booking.status === 'in_progress' || isCompleted ? 'active' : ''} ${booking.status === 'in_progress' || isCompleted ? 'done' : ''}`}>
            <div className="track-progress-dot" />
            <span>Motorista a caminho</span>
          </div>
          <div className={`track-progress-line ${booking.status === 'in_progress' || isCompleted ? 'active' : ''}`} />
          <div className={`track-progress-step ${booking.status === 'in_progress' || isCompleted ? 'active' : ''} ${isCompleted ? 'done' : ''}`}>
            <div className="track-progress-dot" />
            <span>Embarque</span>
          </div>
          <div className={`track-progress-line ${isCompleted ? 'active' : ''}`} />
          <div className={`track-progress-step ${isCompleted ? 'active done' : ''}`}>
            <div className="track-progress-dot" />
            <span>Destino</span>
          </div>
        </div>

        {/* Driver */}
        {booking.driver && (
          <div className="track-driver">
            <div className="track-driver-avatar">{booking.driver.name?.charAt(0)?.toUpperCase()}</div>
            <div className="track-driver-info">
              <strong>{booking.driver.name}</strong>
              <span>{booking.driver.vehicleType === 'car' ? '🚗' : '🏍️'} {booking.driver.vehiclePlate || ''} · ⭐ {booking.driver.rating?.toFixed(1) || '5.0'}</span>
            </div>
            {showDriverTracking && eta && (
              <div className="track-eta-badge">
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>{eta}</span>
              </div>
            )}
            <button className="track-driver-call" onClick={() => { if (booking.driver?.phone) window.open(`tel:${booking.driver.phone}`) }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
          </div>
        )}

        {/* Driver tracking status */}
        {showDriverTracking && !driverLocation && (
          <div className="track-driver-waiting">
            <span className="track-pulse" />
            <span>Aguardando localização do motorista...</span>
          </div>
        )}

        {/* Route */}
        <div className="track-route">
          <div className="track-route-point">
            <div className="track-route-dot green" />
            <div className="track-route-text">
              <span className="track-route-label">Origem</span>
              <span className="track-route-address">{booking.pickup?.address}</span>
              {booking.pickup?.complement && <span className="track-route-complement">{booking.pickup.complement}</span>}
            </div>
          </div>
          <div className="track-route-line" />
          <div className="track-route-point">
            <div className="track-route-dot red" />
            <div className="track-route-text">
              <span className="track-route-label">Destino</span>
              <span className="track-route-address">{booking.dropoff?.address}</span>
              {booking.dropoff?.complement && <span className="track-route-complement">{booking.dropoff.complement}</span>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="track-details">
          <div className="track-detail">
            <span className="track-detail-icon">📏</span>
            <span className="track-detail-val">{booking.distance?.toFixed(1) || '-'} km</span>
          </div>
          <div className="track-detail">
            <span className="track-detail-icon">🚗</span>
            <span className="track-detail-val">{booking.serviceCategory === 'driver' ? 'Corrida' : booking.serviceCategory === 'delivery' ? 'Entrega' : 'Pacote'}</span>
          </div>
          <div className="track-detail highlight">
            <span className="track-detail-icon">💰</span>
            <span className="track-detail-val">R$ {(booking.estimatedPrice || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="track-notes">
            <span>📝</span> {booking.notes}
          </div>
        )}

        {/* Detailed receipt for completed rides */}
        {isCompleted && (
          <div className="track-receipt">
            <div className="track-receipt-title">📄 Recibo da Corrida</div>
            <div className="track-receipt-row">
              <span>Tarifa base</span>
              <span>R$ {booking.serviceCategory === 'driver' ? '5.00' : booking.serviceCategory === 'delivery' ? '3.00' : '4.00'}</span>
            </div>
            <div className="track-receipt-row">
              <span>Distância ({booking.distance?.toFixed(1) || '0'} km)</span>
              <span>R$ {booking.distance ? (booking.distance * (booking.serviceCategory === 'driver' ? 2.50 : booking.serviceCategory === 'delivery' ? 1.50 : 2.00)).toFixed(2) : '0.00'}</span>
            </div>
            {booking.duration && (
              <div className="track-receipt-row">
                <span>Duração ({booking.duration} min)</span>
                <span>-</span>
              </div>
            )}
            <div className="track-receipt-row">
              <span>Taxa plataforma (20%)</span>
              <span>- R$ {((booking.finalPrice || booking.estimatedPrice || 0) * 0.20).toFixed(2)}</span>
            </div>
            <div className="track-receipt-row total">
              <span>Total</span>
              <span>R$ {(booking.finalPrice || booking.estimatedPrice || 0).toFixed(2)}</span>
            </div>
            <div className="track-receipt-row">
              <span>Pagamento</span>
              <span>{booking.paymentMethod === 'pix' ? 'PIX' : booking.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : booking.paymentMethod === 'debit_card' ? 'Cartão de Débito' : 'Dinheiro'}</span>
            </div>
            <div className="track-receipt-row">
              <span>Status</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Pago</span>
            </div>
            {booking.cancelFee && booking.cancelFee > 0 && (
              <div className="track-receipt-row" style={{ color: '#ef4444' }}>
                <span>Taxa cancelamento</span>
                <span>R$ {booking.cancelFee.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Rating prompt for completed rides */}
        {isCompleted && !booking.rating?.client && (
          <div className="track-rating-prompt">
            <span>Como foi sua corrida?</span>
            <div className="track-rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className="track-rating-star"
                  onClick={async () => {
                    try {
                      await api.put(`/bookings/${id}/rate`, { rating: star, ratingType: 'client' })
                      loadBooking()
                    } catch {}
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="track-actions">
            {booking.status === 'accepted' && booking.qrCodeVerified !== true && (
              <button className="track-btn primary" onClick={() => setShowQrVerify(true)}>
                Confirmar Embarque (QR Code)
              </button>
            )}
            {booking.status === 'accepted' && booking.qrCodeVerified === true && (
              <div className="track-qr-verified">
                ✅ Embarque confirmado — aguardando motorista iniciar
              </div>
            )}
            <button className="track-btn cancel" onClick={handleCancel}>Cancelar</button>
          </div>
        )}
        {isCompleted && (
          <div className="track-actions">
            <button className="track-btn primary" onClick={() => navigate('/')}>Nova Corrida</button>
          </div>
        )}
        {isCancelled && (
          <div className="track-actions">
            <button className="track-btn primary" onClick={() => navigate('/rides/new')}>Solicitar Nova</button>
          </div>
        )}
      </div>

      {/* QR Code Verify Modal */}
      {showQrVerify && (
        <div className="track-qr-modal-overlay" onClick={() => { setShowQrVerify(false); setQrResult(null); setQrCode('') }}>
          <div className="track-qr-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar Embarque</h3>
            <p>Solicite o QR Code ao motorista e digite o código abaixo:</p>
            <input
              type="text"
              className="track-qr-input"
              placeholder="Digite o código do QR Code"
              value={qrCode}
              onChange={e => setQrCode(e.target.value)}
              disabled={qrVerifying}
            />
            {qrResult === 'success' && (
              <div className="track-qr-success">✅ Embarque confirmado com sucesso!</div>
            )}
            {qrResult === 'error' && (
              <div className="track-qr-error">❌ Código inválido. Verifique com o motorista.</div>
            )}
            <div className="track-qr-actions">
              <button className="track-btn cancel" onClick={() => { setShowQrVerify(false); setQrResult(null); setQrCode('') }}>
                Cancelar
              </button>
              <button
                className="track-btn primary"
                onClick={handleVerifyQR}
                disabled={qrVerifying || !qrCode.trim()}
              >
                {qrVerifying ? 'Verificando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat FAB */}
      {showDriverTracking && (
        <button className="chat-fab" onClick={openChat}>
          💬
          {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="chat-overlay" onClick={() => setShowChat(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <h3>Chat com Motorista</h3>
              <button className="chat-close" onClick={() => setShowChat(false)}>✕</button>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty">Nenhuma mensagem ainda</div>
              )}
              {messages.map((msg) => {
                const isSent = msg.senderModel === 'User'
                return (
                  <div key={msg._id} className={`chat-msg ${isSent ? 'sent' : 'received'}`}>
                    {msg.content}
                    <span className="chat-msg-time">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-wrap">
              <input
                ref={chatInputRef}
                className="chat-input"
                placeholder="Digite sua mensagem..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
              />
              <button className="chat-send" onClick={handleSendChat} disabled={!chatInput.trim()}>
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
