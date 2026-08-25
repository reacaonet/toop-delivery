import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Navigation, Play, CheckCircle, Clock } from 'lucide-react'
import { bookingService } from '../api'

export default function ActiveRidePage() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadActiveRide()
    const interval = setInterval(loadActiveRide, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadActiveRide = async () => {
    try {
      const result = await bookingService.getBookings({ status: 'accepted' })
      const items = result?.data || []
      const list = Array.isArray(items) ? items : []
      if (list.length > 0) {
        setBooking(list[0])
      } else {
        const result2 = await bookingService.getBookings({ status: 'in_progress' })
        const items2 = result2?.data || []
        const list2 = Array.isArray(items2) ? items2 : []
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

  return (
    <div className="page-container">
      <div className="active-ride">
        <div className="active-ride-status">
          <Clock size={16} />
          <span>{booking.status === 'accepted' ? 'A caminho do passageiro' : 'Corrida em andamento'}</span>
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

        <div className="ride-info-row">
          <span>Distância: {booking.distance?.toFixed(1) || '-'} km</span>
          <span>Valor: R$ {(booking.estimatedPrice || 0).toFixed(2)}</span>
        </div>

        <div className="ride-actions">
          <button className="btn-maps" onClick={openMaps}>
            <Navigation size={16} /> Abrir no Maps
          </button>

          {booking.status === 'accepted' && (
            <button className="btn-start" onClick={handleStart} disabled={updating}>
              <Play size={16} /> {updating ? 'Iniciando...' : 'Iniciar Corrida'}
            </button>
          )}

          {booking.status === 'in_progress' && (
            <button className="btn-complete" onClick={handleComplete} disabled={updating}>
              <CheckCircle size={16} /> {updating ? 'Finalizando...' : 'Finalizar Corrida'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
