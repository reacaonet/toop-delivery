import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, X } from 'lucide-react'
import { bookingService } from '../api'
import { io } from 'socket.io-client'

const SERVICE_LABELS: Record<string, string> = {
  driver: 'Corrida',
  delivery: 'Entrega',
  package: 'Pacote',
}

export default function AvailableRidesPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [countering, setCountering] = useState<string | null>(null)
  const [counterOpen, setCounterOpen] = useState<string | null>(null)
  const [counterPrice, setCounterPrice] = useState<Record<string, string>>({})
  const socketRef = useRef<any>(null)

  useEffect(() => {
    loadBookings()
    const interval = setInterval(loadBookings, 8000)

    const token = localStorage.getItem('token')
    if (token) {
      const socket = io('http://localhost:8100', { auth: { token } })
      socketRef.current = socket

      socket.on('booking:ride_taken', (data: { bookingId: string }) => {
        setBookings(prev => prev.filter(b => b._id !== data.bookingId))
      })

      socket.on('booking:ride_request', () => {
        loadBookings()
      })
    }

    return () => {
      clearInterval(interval)
      socketRef.current?.disconnect()
    }
  }, [])

  const loadBookings = async () => {
    try {
      const result = await bookingService.getBookings({ status: 'matching' })
      const list = Array.isArray(result) ? result : (result?.data || [])
      setBookings(list)
    } catch (error) {
      console.error('Erro ao carregar corridas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    setAccepting(id)
    try {
      await bookingService.acceptBooking(id)
      navigate('/active-ride')
    } catch (error: any) {
      alert('Erro ao aceitar: ' + (error.response?.data?.error || error.message))
    } finally {
      setAccepting(null)
    }
  }

  const handleReject = async (id: string) => {
    setRejecting(id)
    try {
      await bookingService.rejectBooking(id)
      setBookings(prev => prev.filter(b => b._id !== id))
    } catch (error: any) {
      console.error('Erro ao recusar:', error)
    } finally {
      setRejecting(null)
    }
  }

  const handleCounterOffer = async (booking: any) => {
    const value = parseFloat((counterPrice[booking._id] || '').replace(',', '.'))
    if (!value || isNaN(value) || value <= 0) {
      alert('Digite um valor válido para a contraproposta')
      return
    }
    setCountering(booking._id)
    try {
      await bookingService.counterOfferBooking(booking._id, value)
      alert('Contraproposta enviada ao cliente de R$ ' + value.toFixed(2).replace('.', ',') + '. Aguarde a resposta do cliente.')
      setCounterOpen(null)
      setCounterPrice(prev => ({ ...prev, [booking._id]: '' }))
    } catch (error: any) {
      alert('Erro ao enviar contraproposta: ' + (error.response?.data?.error || error.message))
    } finally {
      setCountering(null)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Corridas Disponíveis</h2>
        <span className="badge">{bookings.length}</span>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <Navigation size={48} />
          <p>Nenhuma corrida disponível no momento</p>
          <span>As novas solicitações aparecerão aqui automaticamente</span>
        </div>
      ) : (
        <div className="orders-list">
          {bookings.map(booking => (
            <div key={booking._id} className="order-card">
              <div className="order-card-header">
                <span className="order-number">#{booking.bookingNumber}</span>
                <span className="order-type-badge">{SERVICE_LABELS[booking.serviceCategory] || booking.serviceCategory}</span>
              </div>

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

              <div className="order-card-footer">
                <span className="order-distance">
                  <Navigation size={12} /> {booking.distance?.toFixed(1) || '-'} km
                </span>
                <span className="order-price">
                  R$ {(booking.proposedPrice ?? booking.estimatedPrice ?? 0).toFixed(2)}
                </span>
              </div>

              {booking.minPrice != null && (
                <div className="order-proposed-hint">
                  💬 Proposta do cliente: <strong>R$ {(booking.proposedPrice ?? booking.estimatedPrice ?? 0).toFixed(2)}</strong>
                  <span> · mín. R$ {booking.minPrice.toFixed(2)}</span>
                </div>
              )}

              {counterOpen === booking._id && (
                <div className="counter-box">
                  <input
                    className="counter-input"
                    type="number"
                    step="0.5"
                    min={booking.minPrice || 0}
                    placeholder="Sua contraproposta (R$)"
                    value={counterPrice[booking._id] || ''}
                    onChange={e => setCounterPrice(prev => ({ ...prev, [booking._id]: e.target.value }))}
                  />
                  <div className="counter-actions">
                    <button className="btn-cancel-small" onClick={() => { setCounterOpen(null); setCounterPrice(prev => ({ ...prev, [booking._id]: '' })) }}>
                      Cancelar
                    </button>
                    <button
                      className="btn-counter-send"
                      disabled={countering === booking._id}
                      onClick={() => handleCounterOffer(booking)}
                    >
                      {countering === booking._id ? 'Enviando...' : 'Enviar contraproposta'}
                    </button>
                  </div>
                </div>
              )}

              <div className="order-card-actions">
                <button
                  className="btn-reject"
                  onClick={() => handleReject(booking._id)}
                  disabled={rejecting === booking._id || accepting === booking._id}
                >
                  <X size={14} />
                  {rejecting === booking._id ? 'Recusando...' : 'Recusar'}
                </button>
                {accepting !== booking._id && (
                  <button
                    className="btn-counter"
                    onClick={() => setCounterOpen(prev => prev === booking._id ? null : booking._id)}
                  >
                    Contrapor
                  </button>
                )}
                <button
                  className="btn-accept"
                  onClick={() => handleAccept(booking._id)}
                  disabled={accepting === booking._id || rejecting === booking._id}
                >
                  {accepting === booking._id ? 'Aceitando...' : 'Aceitar Corrida'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
