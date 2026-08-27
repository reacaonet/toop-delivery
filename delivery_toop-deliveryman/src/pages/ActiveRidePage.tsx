import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Navigation, Play, CheckCircle, Clock, AlertCircle, QrCode } from 'lucide-react'
import { io } from 'socket.io-client'
import { bookingService, deliverymanService, messageService } from '../api'

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
  if (minutes < 1) return 'chegando'
  if (minutes === 1) return '1 min'
  return `${minutes} min`
}

export default function ActiveRidePage() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [distToTarget, setDistToTarget] = useState<string | null>(null)
  const [currentLat, setCurrentLat] = useState<number | null>(null)
  const [currentLng, setCurrentLng] = useState<number | null>(null)
  const watchRef = useRef<number | null>(null)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const socketRef = useRef<any>(null)

  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatToast, setChatToast] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadActiveRide()
    const interval = setInterval(loadActiveRide, 10000)
    return () => clearInterval(interval)
  }, [])

  // Socket connection for real-time ride status updates
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = window.location.port === '4204'
      ? 'http://localhost:8100'
      : window.location.origin

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('booking:accepted', (data: any) => {
      loadActiveRide()
    })

    socket.on('booking:in_progress', (data: any) => {
      loadActiveRide()
    })

    socket.on('booking:completed', (data: any) => {
      navigate('/')
    })

    socket.on('booking:cancelled', (data: any) => {
      navigate('/')
    })

    socketRef.current = socket

    return () => { socket.disconnect(); socketRef.current = null }
  }, [])

  // Track location during active ride
  useEffect(() => {
    if (!booking || !['accepted', 'in_progress'].includes(booking.status)) return

    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setCurrentLat(lat)
          setCurrentLng(lng)

          deliverymanService.updateLocation(lat, lng).catch(() => {})

          if (booking) {
            const target = booking.status === 'accepted' ? booking.pickup : booking.dropoff
            if (target?.lat && target?.lng) {
              const dist = haversineDistance(lat, lng, target.lat, target.lng)
              if (dist < 1) {
                setDistToTarget(`${Math.round(dist * 1000)}m`)
              } else {
                setDistToTarget(`${dist.toFixed(1)}km`)
              }
            }
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      )
    }

    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [booking?.status])

  // Chat socket listener — always active to receive messages
  useEffect(() => {
    if (!booking?._id || !socketRef.current) return
    const socket = socketRef.current

    socket.emit('chat:join_booking', { bookingId: booking._id })

    const handleMessage = (data: any) => {
      if (data.bookingId === booking._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message?._id)) return prev
          return [...prev, data.message]
        })
        if (!showChat) {
          setUnreadCount(u => u + 1)
          setChatToast('💬 Nova mensagem do passageiro')
          setTimeout(() => setChatToast(null), 3500)
        }
      }
    }
    socket.on('chat:new_message', handleMessage)

    return () => {
      socket.off('chat:new_message', handleMessage)
      socket.emit('chat:leave_booking', { bookingId: booking._id })
    }
  }, [booking?._id, socketRef.current, showChat])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat messages when opening
  useEffect(() => {
    if (!showChat || !booking?._id) return
    loadChatMessages()
    messageService.markAsRead(booking._id).catch(() => {})
    setUnreadCount(0)
  }, [showChat, booking?._id])

  const loadChatMessages = async () => {
    if (!booking?._id) return
    try {
      const result = await messageService.getMessages(booking._id)
      const msgList = Array.isArray(result) ? result : (result?.data || [])
      setMessages(msgList)
    } catch {}
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !booking?._id) return
    const content = chatInput.trim()
    setChatInput('')
    try {
      await messageService.send(booking._id, content)
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
    setChatToast(null)
    loadChatMessages()
    messageService.markAsRead(booking?._id).catch(() => {})
  }

  const loadActiveRide = async () => {
    try {
      const result = await bookingService.getBookings({ status: 'accepted' })
      const list = Array.isArray(result) ? result : (result?.data || [])
      if (list.length > 0) {
        setBooking(list[0])
      } else {
        const result2 = await bookingService.getBookings({ status: 'in_progress' })
        const list2 = Array.isArray(result2) ? result2 : (result2?.data || [])
        if (list2.length > 0) {
          setBooking(list2[0])
        } else {
          setBooking(null)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar corrida:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!booking) return
    setUpdating(true)
    try {
      await bookingService.startBooking(booking._id)
      loadActiveRide()
    } catch (error: any) {
      alert('Erro: ' + (error.response?.data?.error || error.message))
    } finally {
      setUpdating(false)
    }
  }

  const handleComplete = async () => {
    if (!booking) return
    setUpdating(true)
    try {
      await bookingService.completeBooking(booking._id)
      navigate('/')
    } catch (error: any) {
      alert('Erro: ' + (error.response?.data?.error || error.message))
    } finally {
      setUpdating(false)
    }
  }

  const openMaps = () => {
    if (!booking) return
    const dest = booking.status === 'accepted' ? booking.pickup : booking.dropoff
    if (dest?.lat && dest?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, '_blank')
    }
  }

  const handleGenerateQR = async () => {
    if (!booking) return
    setQrLoading(true)
    try {
      const result = await bookingService.generateQRCode(booking._id) as any
      const data = result?.qrCode ? result : result?.data || {}
      setQrImage(data.qrCode || null)
      setQrToken(data.token || null)
      setShowQr(true)
    } catch (error: any) {
      alert('Erro ao gerar QR Code: ' + (error.response?.data?.error || error.message))
    } finally {
      setQrLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  if (!booking) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <CheckCircle size={48} />
          <p>Nenhuma corrida ativa</p>
          <span>Aguardando novas solicitações...</span>
        </div>
      </div>
    )
  }

  const isGoingToPickup = booking.status === 'accepted'
  const isRideInProgress = booking.status === 'in_progress'

  return (
    <div className="page-container">
      <div className="active-ride">
        {/* Status header */}
        <div className={`active-ride-status ${isGoingToPickup ? 'pickup' : 'riding'}`}>
          <Clock size={16} />
          <span>{isGoingToPickup ? 'Indo buscar o passageiro' : 'Corrida em andamento'}</span>
          {distToTarget && (
            <span className="active-ride-eta">{distToTarget}</span>
          )}
        </div>

        {/* Step indicator */}
        <div className="ride-steps">
          <div className={`ride-step ${isGoingToPickup || isRideInProgress ? 'active done' : ''}`}>
            <div className="ride-step-dot" />
            <span>Embarque</span>
          </div>
          <div className={`ride-step-line ${isRideInProgress ? 'active' : ''}`} />
          <div className={`ride-step ${isRideInProgress ? 'active' : ''}`}>
            <div className="ride-step-dot" />
            <span>Destino</span>
          </div>
        </div>

        {/* Target address - PROMINENT */}
        <div className="ride-target-card">
          <div className="ride-target-label">
            {isGoingToPickup ? '📍 IR ATÉ O PASSAGEIRO' : '🎯 LEVAR AO DESTINO'}
          </div>
          <div className="ride-target-address">
            {isGoingToPickup ? booking.pickup?.address : booking.dropoff?.address}
          </div>
          {(isGoingToPickup ? booking.pickup?.complement : booking.dropoff?.complement) && (
            <div className="ride-target-complement">
              {isGoingToPickup ? booking.pickup.complement : booking.dropoff.complement}
            </div>
          )}
          {distToTarget && (
            <div className="ride-target-dist">Distância: {distToTarget} · ~{formatETA(parseFloat(distToTarget) || 0)}</div>
          )}
        </div>

        {/* Full route */}
        <div className="order-route">
          <div className="route-point">
            <MapPin size={14} color="#10b981" />
            <span>{booking.pickup?.address}</span>
          </div>
          <div className="route-line" />
          <div className="route-point">
            <MapPin size={14} color="#ef4444" />
            <span>{booking.dropoff?.address}</span>
          </div>
        </div>

        {/* Client card */}
        {booking.client && (
          <div className="ride-client-card">
            <div className="client-avatar">{booking.client.name?.charAt(0)?.toUpperCase()}</div>
            <div className="client-info">
              <strong>{booking.client.name}</strong>
              <span>{booking.client.phone}</span>
            </div>
            {booking.client.phone && (
              <a href={`tel:${booking.client.phone}`} className="btn-call">
                <Phone size={16} />
              </a>
            )}
          </div>
        )}

        {/* Ride info */}
        <div className="ride-info-row">
          <span>Distância: {booking.distance?.toFixed(1) || '-'} km</span>
          <span>Valor: R$ {(booking.estimatedPrice || 0).toFixed(2)}</span>
        </div>

        {/* No GPS warning */}
        {currentLat === null && (
          <div className="ride-warning">
            <AlertCircle size={14} />
            <span>Ative a localização para compartilhar posição</span>
          </div>
        )}

        {/* Actions */}
        <div className="ride-actions">
          <button className="btn-maps" onClick={openMaps}>
            <Navigation size={16} /> {isGoingToPickup ? 'Navegar até Embarque' : 'Navegar até Destino'}
          </button>

          <button className="chat-fab" onClick={openChat}>
            💬 Chat
            {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
          </button>

          <button className="btn-qr" onClick={handleGenerateQR} disabled={qrLoading}>
            <QrCode size={16} /> {qrLoading ? 'Gerando...' : 'QR Code'}
          </button>

          {isGoingToPickup && (
            <button className="btn-start" onClick={handleStart} disabled={updating}>
              <Play size={16} /> {updating ? 'Iniciando...' : 'Iniciar Corrida'}
            </button>
          )}

          {isRideInProgress && (
            <button className="btn-complete" onClick={handleComplete} disabled={updating}>
              <CheckCircle size={16} /> {updating ? 'Finalizando...' : 'Finalizar Corrida'}
            </button>
          )}
        </div>
      </div>

      {/* Chat notification toast */}
      {chatToast && (
        <div className="chat-toast">{chatToast}</div>
      )}

      {/* QR Code Modal */}
      {showQr && qrImage && (
        <div className="qr-overlay" onClick={() => setShowQr(false)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <h3>QR Code da Corrida</h3>
            <p className="qr-modal-subtitle">Peça para o passageiro escanear</p>
            <img src={qrImage} alt="QR Code" className="qr-image" />
            {qrToken && <div className="qr-token-display">Código: <strong>{qrToken}</strong></div>}
            <div className="qr-booking-number">#{booking?.bookingNumber}</div>
            <button className="qr-close-btn" onClick={() => setShowQr(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="chat-overlay" onClick={() => setShowChat(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <h3>Chat com Passageiro</h3>
              <button className="chat-close" onClick={() => setShowChat(false)}>✕</button>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty">Nenhuma mensagem ainda</div>
              )}
              {messages.map((msg) => {
                const isSent = msg.senderModel === 'Driver'
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
