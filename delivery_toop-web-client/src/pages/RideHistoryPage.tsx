import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendente',
  matching: 'Buscando',
  accepted: 'Aceita',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  matching: '#3b82f6',
  accepted: '#8b5cf6',
  in_progress: '#06b6d4',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export default function RideHistoryPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/bookings')
      const items = data.data?.data || data.data || []
      setBookings(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error('Erro ao carregar corridas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
      <h1 className="page-title">Minhas Corridas</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>Nenhuma corrida encontrada</h3>
          <p>Solicite sua primeira corrida!</p>
          <button className="btn btn-primary" onClick={() => navigate('/rides/new')}>
            Solicitar Corrida
          </button>
        </div>
      ) : (
        <div className="rides-list">
          {bookings.map(booking => (
            <div
              key={booking._id}
              className="ride-history-card"
              onClick={() => navigate(`/rides/${booking._id}`)}
            >
              <div className="ride-history-header">
                <span className="ride-history-number">#{booking.bookingNumber}</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: STATUS_COLORS[booking.status] || '#666', color: '#fff' }}
                >
                  {STATUS_MAP[booking.status] || booking.status}
                </span>
              </div>
              <div className="ride-history-route">
                <div className="ride-route-point">
                  <span className="route-dot pickup" />
                  <span>{booking.pickup?.address}</span>
                </div>
                <div className="ride-route-line" />
                <div className="ride-route-point">
                  <span className="route-dot dropoff" />
                  <span>{booking.dropoff?.address}</span>
                </div>
              </div>
              <div className="ride-history-footer">
                <span>{booking.distance?.toFixed(1) || '-'} km</span>
                <span>R$ {(booking.finalPrice || booking.estimatedPrice || 0).toFixed(2)}</span>
                <span>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
