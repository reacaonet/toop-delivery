import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api'

const SERVICE_OPTIONS = [
  { value: 'driver', label: 'Corrida', icon: '🚗', description: 'Transporte de passageiros', basePrice: 5.00, perKm: 2.50 },
  { value: 'delivery', label: 'Entrega', icon: '📦', description: 'Entrega de documentos/pacotes', basePrice: 3.00, perKm: 1.50 },
  { value: 'package', label: 'Pacote', icon: '📮', description: 'Envio de pacotes', basePrice: 4.00, perKm: 2.00 },
]

const PAYMENT_OPTIONS = [
  { value: 'credit_card', label: 'Crédito', icon: '💳' },
  { value: 'debit_card', label: 'Débito', icon: '💳' },
  { value: 'cash', label: 'Dinheiro', icon: '💵' },
  { value: 'pix', label: 'PIX', icon: '📱' },
]

interface AddressSuggestion {
  display_name: string
  lat: string
  lon: string
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function RideRequestPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [serviceCategory, setServiceCategory] = useState('driver')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupComplement, setPickupComplement] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [dropoffComplement, setDropoffComplement] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [pickupLat, setPickupLat] = useState(0)
  const [pickupLng, setPickupLng] = useState(0)
  const [dropoffLat, setDropoffLat] = useState(0)
  const [dropoffLng, setDropoffLng] = useState(0)

  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)

  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [estimatedDuration, setEstimatedDuration] = useState<string | null>(null)

  const pickupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropoffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pickupRef = useRef<HTMLDivElement>(null)
  const dropoffRef = useRef<HTMLDivElement>(null)

  const selectedService = SERVICE_OPTIONS.find(s => s.value === serviceCategory)

  // Auto-detect current location for pickup
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setPickupLat(lat)
          setPickupLng(lng)

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
              { headers: { 'Accept-Language': 'pt-BR' } }
            )
            const data = await res.json()
            if (data.display_name) {
              const short = data.display_name.split(',').slice(0, 3).join(',')
              setPickupAddress(short)
            }
          } catch {}
          setLocationLoading(false)
        },
        () => {
          setPickupAddress('Localização atual')
          setLocationLoading(false)
        }
      )
    } else {
      setLocationLoading(false)
    }
  }, [])

  // Calculate distance/price when both points are set
  useEffect(() => {
    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      const dist = haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng)
      setEstimatedDistance(Math.round(dist * 100) / 100)
      if (selectedService) {
        setEstimatedPrice(Math.round((selectedService.basePrice + dist * selectedService.perKm) * 100) / 100)
      }
      const mins = Math.round(dist * 3)
      setEstimatedDuration(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`)
    } else {
      setEstimatedDistance(null)
      setEstimatedPrice(null)
      setEstimatedDuration(null)
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, selectedService])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target as Node)) {
        setShowPickupSuggestions(false)
      }
      if (dropoffRef.current && !dropoffRef.current.contains(e.target as Node)) {
        setShowDropoffSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchAddresses = useCallback(async (query: string, type: 'pickup' | 'dropoff') => {
    if (query.length < 3) {
      if (type === 'pickup') setPickupSuggestions([])
      else setDropoffSuggestions([])
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      )
      const data: AddressSuggestion[] = await res.json()
      if (type === 'pickup') setPickupSuggestions(data)
      else setDropoffSuggestions(data)
    } catch {}
  }, [])

  const handlePickupChange = (value: string) => {
    setPickupAddress(value)
    setShowPickupSuggestions(true)
    if (pickupTimeoutRef.current) clearTimeout(pickupTimeoutRef.current)
    pickupTimeoutRef.current = setTimeout(() => searchAddresses(value, 'pickup'), 400)
  }

  const handleDropoffChange = (value: string) => {
    setDropoffAddress(value)
    setShowDropoffSuggestions(true)
    setDropoffLat(0)
    setDropoffLng(0)
    if (dropoffTimeoutRef.current) clearTimeout(dropoffTimeoutRef.current)
    dropoffTimeoutRef.current = setTimeout(() => searchAddresses(value, 'dropoff'), 400)
  }

  const selectPickupSuggestion = (s: AddressSuggestion) => {
    setPickupAddress(s.display_name.split(',').slice(0, 3).join(','))
    setPickupLat(parseFloat(s.lat))
    setPickupLng(parseFloat(s.lon))
    setShowPickupSuggestions(false)
    setPickupSuggestions([])
  }

  const selectDropoffSuggestion = (s: AddressSuggestion) => {
    setDropoffAddress(s.display_name.split(',').slice(0, 3).join(','))
    setDropoffLat(parseFloat(s.lat))
    setDropoffLng(parseFloat(s.lon))
    setShowDropoffSuggestions(false)
    setDropoffSuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      showToast('Preencha origem e destino', 'error')
      return
    }
    if (!dropoffLat || !dropoffLng) {
      showToast('Selecione o destino nas sugestões', 'error')
      return
    }
    if (scheduleEnabled && (!scheduleDate || !scheduleTime)) {
      showToast('Preencha data e horário do agendamento', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        serviceCategory,
        pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng, complement: pickupComplement || undefined },
        dropoff: { address: dropoffAddress, lat: dropoffLat, lng: dropoffLng, complement: dropoffComplement || undefined },
        paymentMethod,
        notes: notes || undefined,
      }
      if (scheduleEnabled && scheduleDate && scheduleTime) {
        payload.scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      }
      const { data } = await api.post('/bookings', payload)
      showToast('Corrida solicitada!', 'success')
      navigate(`/rides/${data.data._id}`)
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao solicitar corrida', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <div className="ride-req">
      <div className="ride-req-header">
        <button className="ride-req-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>Nova Corrida</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="ride-req-body">
        {/* Service */}
        <div className="ride-req-card">
          <div className="ride-req-card-title">Serviço</div>
          <div className="ride-req-services">
            {SERVICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`ride-req-service ${serviceCategory === opt.value ? 'active' : ''}`}
                onClick={() => setServiceCategory(opt.value)}
              >
                <span className="ride-req-service-icon">{opt.icon}</span>
                <span className="ride-req-service-name">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Addresses */}
        <div className="ride-req-card">
          <div className="ride-req-addresses">
            <div className="ride-req-address-group" ref={pickupRef}>
              <div className="ride-req-dot green" />
              <div className="ride-req-input-wrap">
                <input
                  className="ride-req-input"
                  type="text"
                  placeholder={locationLoading ? 'Detectando localização...' : 'Origem'}
                  value={pickupAddress}
                  onChange={e => handlePickupChange(e.target.value)}
                  onFocus={() => setShowPickupSuggestions(true)}
                />
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="ride-req-suggestions">
                    {pickupSuggestions.map((s, i) => (
                      <button key={i} type="button" className="ride-req-suggestion" onClick={() => selectPickupSuggestion(s)}>
                        <span className="ride-req-suggestion-icon">📍</span>
                        <span>{s.display_name.split(',').slice(0, 3).join(',')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ride-req-line" />

            <div className="ride-req-address-group" ref={dropoffRef}>
              <div className="ride-req-dot red" />
              <div className="ride-req-input-wrap">
                <input
                  className="ride-req-input"
                  type="text"
                  placeholder="Para onde vai?"
                  value={dropoffAddress}
                  onChange={e => handleDropoffChange(e.target.value)}
                  onFocus={() => setShowDropoffSuggestions(true)}
                />
                {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                  <div className="ride-req-suggestions">
                    {dropoffSuggestions.map((s, i) => (
                      <button key={i} type="button" className="ride-req-suggestion" onClick={() => selectDropoffSuggestion(s)}>
                        <span className="ride-req-suggestion-icon">📍</span>
                        <span>{s.display_name.split(',').slice(0, 3).join(',')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <input
            className="ride-req-complement"
            type="text"
            placeholder="Complemento (opcional)"
            value={dropoffComplement}
            onChange={e => setDropoffComplement(e.target.value)}
          />
        </div>

        {/* Estimation */}
        {estimatedDistance !== null && (
          <div className="ride-req-estimation">
            <div className="ride-req-est-item">
              <span className="ride-req-est-icon">📏</span>
              <span className="ride-req-est-val">{estimatedDistance} km</span>
            </div>
            <div className="ride-req-est-divider" />
            <div className="ride-req-est-item">
              <span className="ride-req-est-icon">⏱️</span>
              <span className="ride-req-est-val">{estimatedDuration}</span>
            </div>
            <div className="ride-req-est-divider" />
            <div className="ride-req-est-item">
              <span className="ride-req-est-icon">💰</span>
              <span className="ride-req-est-val">{formatCurrency(estimatedPrice!)}</span>
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="ride-req-card">
          <div className="ride-req-card-title">Pagamento</div>
          <div className="ride-req-payments">
            {PAYMENT_OPTIONS.map(m => (
              <button
                key={m.value}
                type="button"
                className={`ride-req-payment ${paymentMethod === m.value ? 'active' : ''}`}
                onClick={() => setPaymentMethod(m.value)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="ride-req-card">
          <label className="ride-req-schedule-toggle">
            <input type="checkbox" checked={scheduleEnabled} onChange={e => setScheduleEnabled(e.target.checked)} />
            <span className="ride-req-toggle-track"><span className="ride-req-toggle-thumb" /></span>
            <span className="ride-req-toggle-info">
              <span className="ride-req-toggle-title">Agendar</span>
              <span className="ride-req-toggle-desc">Escolha data e horário</span>
            </span>
          </label>
          {scheduleEnabled && (
            <div className="ride-req-schedule-fields">
              <input className="ride-req-schedule-input" type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              <input className="ride-req-schedule-input" type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="ride-req-card">
          <textarea
            className="ride-req-notes"
            placeholder="Observação para o motorista (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Submit */}
        <button
          className="ride-req-submit"
          onClick={handleSubmit}
          disabled={submitting || !dropoffLat}
        >
          {submitting ? (
            <span>Carregando...</span>
          ) : (
            <>
              <span>Solicitar {selectedService?.label}</span>
              {estimatedPrice && <span className="ride-req-submit-price">{formatCurrency(estimatedPrice)}</span>}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
