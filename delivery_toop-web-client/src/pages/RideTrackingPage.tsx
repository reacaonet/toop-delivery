import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
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

export default function RideTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    // Pickup marker (green)
    const pickupIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#22c55e;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">A</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map)

    // Dropoff marker (red)
    const dropoffIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#ef4444;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">B</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map)

    // Route line
    L.polyline(
      [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
      { color: '#6366f1', weight: 5, opacity: 0.9 }
    ).addTo(map)

    // Fit bounds
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

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar?')) return
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelado pelo cliente', cancelledBy: 'client' })
      loadBooking()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="page"><div className="alert-error">{error}</div><button className="btn-back" onClick={() => navigate('/')}>← Voltar</button></div>
  if (!booking) return null

  const isCancelled = booking.status === 'cancelled'
  const isCompleted = booking.status === 'completed'
  const isActive = ['matching', 'accepted', 'in_progress'].includes(booking.status)

  return (
    <div className="track">
      {/* Map */}
      <div className="track-map-wrap">
        <button className="track-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div ref={mapRef} className="track-map" />
        {isActive && (
          <div className="track-status-pill">
            <span className="track-status-dot" />
            {STATUS_MAP[booking.status]}
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

        {/* Driver */}
        {booking.driver && (
          <div className="track-driver">
            <div className="track-driver-avatar">{booking.driver.name?.charAt(0)?.toUpperCase()}</div>
            <div className="track-driver-info">
              <strong>{booking.driver.name}</strong>
              <span>{booking.driver.vehicleType === 'car' ? '🚗' : '🏍️'} {booking.driver.vehiclePlate || ''} · ⭐ {booking.driver.rating?.toFixed(1) || '5.0'}</span>
            </div>
            <button className="track-driver-call" onClick={() => {}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
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

        {/* Actions */}
        {isActive && (
          <div className="track-actions">
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
    </div>
  )
}
