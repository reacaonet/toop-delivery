import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendente',
  matching: 'Buscando motorista...',
  accepted: 'Motorista a caminho',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

const STATUS_STEPS = ['matching', 'accepted', 'in_progress', 'completed']

export default function RideTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    loadBooking()
    const interval = setInterval(loadBooking, 5000)
    return () => clearInterval(interval)
  }, [id])

  const loadBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`)
      setBooking(data.data)
      setError('')
    } catch (err: any) {
      setError('Corrida não encontrada')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta corrida?')) return
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelado pelo cliente', cancelledBy: 'client' })
      loadBooking()
    } catch (err: any) {
      alert('Erro ao cancelar: ' + (err.response?.data?.error || err.message))
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="page"><div className="alert-error">{error}</div><button className="btn-back" onClick={() => navigate('/')}>← Voltar</button></div>
  if (!booking) return null

  const currentStep = STATUS_STEPS.indexOf(booking.status)
  const isCancelled = booking.status === 'cancelled'
  const isCompleted = booking.status === 'completed'
  const canCancel = ['matching', 'accepted'].includes(booking.status)

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
      
      <div className="ride-tracking">
        <div className="ride-tracking-header">
          <h1>Corrida #{booking.bookingNumber}</h1>
          <span className={`status-badge status-${booking.status === 'in_progress' ? 'delivering' : booking.status === 'completed' ? 'delivered' : booking.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
            {STATUS_MAP[booking.status] || booking.status}
          </span>
        </div>

        {!isCancelled && !isCompleted && (
          <div className="status-timeline">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`timeline-step ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
                <div className="timeline-dot">{i < currentStep ? '✓' : i + 1}</div>
                <span className="timeline-label">{STATUS_MAP[step]}</span>
                {i < STATUS_STEPS.length - 1 && <div className="timeline-line" />}
              </div>
            ))}
          </div>
        )}

        <div className="ride-tracking-body">
          <div className="ride-info-grid">
            <div className="ride-info-card">
              <h3>📍 Origem</h3>
              <p>{booking.pickup?.address}</p>
              {booking.pickup?.complement && <span className="ride-complement">{booking.pickup.complement}</span>}
            </div>
            <div className="ride-info-card">
              <h3>🏁 Destino</h3>
              <p>{booking.dropoff?.address}</p>
              {booking.dropoff?.complement && <span className="ride-complement">{booking.dropoff.complement}</span>}
            </div>
            <div className="ride-info-card">
              <h3>🚗 Tipo</h3>
              <p>{booking.serviceCategory === 'driver' ? 'Corrida' : booking.serviceCategory === 'delivery' ? 'Entrega' : 'Pacote'}</p>
            </div>
            <div className="ride-info-card">
              <h3>📏 Distância</h3>
              <p>{booking.distance?.toFixed(1) || '-'} km</p>
            </div>
          </div>

          {booking.driver && (
            <div className="ride-driver-card">
              <h3>Motorista</h3>
              <div className="driver-info">
                <div className="driver-avatar">{booking.driver.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <strong>{booking.driver.name}</strong>
                  <span>{booking.driver.vehicleType === 'car' ? '🚗' : booking.driver.vehicleType === 'motorcycle' ? '🏍️' : '🚗'} {booking.driver.vehiclePlate || ''}</span>
                  <span>⭐ {booking.driver.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="ride-price-card">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Distância</span>
                <span>{booking.distance?.toFixed(2) || '-'} km</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total Estimado</span>
                <span>R$ {(booking.estimatedPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="ride-notes">
              <h3>📝 Observações</h3>
              <p>{booking.notes}</p>
            </div>
          )}

          {booking.status === 'in_progress' && (
            <div className="ride-actions">
              <button className="btn btn-primary btn-lg btn-full" onClick={() => {}}>
                📱 Acompanhar no Mapa
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="ride-completed-actions">
              <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/')}>
                Solicitar Nova Corrida
              </button>
            </div>
          )}

          {canCancel && (
            <div className="ride-actions">
              <button className="btn btn-danger btn-full" onClick={handleCancel}>
                Cancelar Corrida
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
