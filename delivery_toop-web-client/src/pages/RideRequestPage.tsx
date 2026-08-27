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

const VEHICLE_OPTIONS = [
  { value: 'car', label: 'Carro', icon: '🚗', multiplier: 1.0 },
  { value: 'moto', label: 'Moto', icon: '🏍️', multiplier: 0.7 },
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
  const [vehicleType, setVehicleType] = useState('car')
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

  const [baseFare, setBaseFare] = useState<number>(0)
  const [distanceFare, setDistanceFare] = useState<number>(0)
  const [surgeAddon, setSurgeAddon] = useState<number>(0)
  const [surgeReason, setSurgeReason] = useState('')
  const [surgeEnabled, setSurgeEnabled] = useState(false)
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.5)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [proposedPrice, setProposedPrice] = useState<number | null>(null)

  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<any>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

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
        const vehicle = VEHICLE_OPTIONS.find(v => v.value === vehicleType) || VEHICLE_OPTIONS[0]
        const base = Math.round(selectedService.basePrice * vehicle.multiplier * 100) / 100
        const perKm = Math.round(selectedService.perKm * vehicle.multiplier * 100) / 100
        const distFare = Math.round(dist * perKm * 100) / 100
        setBaseFare(base)
        setDistanceFare(distFare)
        const surge = surgeEnabled ? Math.round((base + distFare) * (surgeMultiplier - 1) * 100) / 100 : 0
        setSurgeAddon(surge)
        const total = Math.round((base + distFare + surge) * 100) / 100
        setEstimatedPrice(total)
        setMinPrice(Math.round((base + distFare) * 0.6 * 100) / 100)
        setProposedPrice(prev => prev === null ? total : prev)
      }
      const mins = Math.round(dist * 3)
      setEstimatedDuration(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`)
    } else {
      setEstimatedDistance(null)
      setEstimatedPrice(null)
      setEstimatedDuration(null)
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, selectedService, vehicleType, surgeEnabled, surgeMultiplier])

  const promoTotal = estimatedPrice !== null
    ? promoApplied ? Math.max(0, estimatedPrice - promoDiscount) : estimatedPrice
    : null

  const effectivePrice = proposedPrice !== null && proposedPrice > 0 ? proposedPrice : estimatedPrice
  const effectiveMin = minPrice || (estimatedPrice ? Math.round(estimatedPrice * 0.6 * 100) / 100 : 0)

  const adjustProposal = (delta: number) => {
    if (effectivePrice === null) return
    const next = Math.max(effectiveMin, Math.round((effectivePrice + delta) * 100) / 100)
    setProposedPrice(Math.round(next * 100) / 100)
  }

  useEffect(() => {
    setPromoApplied(null)
    setPromoDiscount(0)
    setPromoError('')
  }, [estimatedPrice, serviceCategory])

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

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || estimatedPrice === null) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const { data } = await api.post('/promo/validate', { code: promoCode.trim(), subtotal: estimatedPrice })
      setPromoApplied(data.data)
      setPromoDiscount(data.data.discount || 0)
    } catch (error: any) {
      setPromoApplied(null)
      setPromoDiscount(0)
      setPromoError(error.response?.data?.error || 'Cupom inválido')
    } finally {
      setPromoLoading(false)
    }
  }

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value)
    setPromoApplied(null)
    setPromoDiscount(0)
    setPromoError('')
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
        vehicleType,
        pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng, complement: pickupComplement || undefined },
        dropoff: { address: dropoffAddress, lat: dropoffLat, lng: dropoffLng, complement: dropoffComplement || undefined },
        paymentMethod,
        notes: notes || undefined,
        proposedPrice: effectivePrice,
        surgeAddon: surgeAddon,
        surgeReason: surgeEnabled ? (surgeReason || `Alta demanda (${surgeMultiplier.toFixed(1)}x)`) : undefined,
      }
      if (scheduleEnabled && scheduleDate && scheduleTime) {
        payload.scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      }
      if (promoApplied) {
        payload.promoCode = promoCode.trim()
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

        {/* Vehicle */}
        <div className="ride-req-card">
          <div className="ride-req-card-title">Veículo</div>
          <div className="ride-req-vehicle">
            {VEHICLE_OPTIONS.map(v => (
              <button
                key={v.value}
                type="button"
                className={`ride-req-vehicle-opt ${vehicleType === v.value ? 'active' : ''}`}
                onClick={() => setVehicleType(v.value)}
              >
                <span className="ride-req-vehicle-icon">{v.icon}</span>
                <span>{v.label}</span>
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
              <span className="ride-req-est-val">{formatCurrency(promoTotal!)}</span>
            </div>
          </div>
        )}

        {/* Price transparency + negotiation */}
        {estimatedPrice !== null && (
          <div className="ride-req-card">
            <div className="ride-req-card-title">Como o preço é formado</div>
            <div className="price-breakdown">
              <div className="price-breakdown-row"><span>Tarifa base</span><span>{formatCurrency(baseFare)}</span></div>
              <div className="price-breakdown-row"><span>Percurso ({estimatedDistance} km)</span><span>{formatCurrency(distanceFare)}</span></div>
              {surgeEnabled && surgeAddon > 0 && (
                <div className="price-breakdown-row surge">
                  <span>⚡ {surgeReason || `Alta demanda (${surgeMultiplier.toFixed(1)}x)`}</span>
                  <span>+ {formatCurrency(surgeAddon)}</span>
                </div>
              )}
              <div className="price-breakdown-row total">
                <span>Valor sugerido pelo app</span>
                <span>{formatCurrency(promoTotal!)}</span>
              </div>
            </div>

            {!surgeEnabled ? (
              <button
                type="button"
                className="ride-req-surge-btn"
                onClick={() => { setSurgeEnabled(true); setSurgeReason('Chuva ⚡'); setSurgeMultiplier(1.5) }}
              >
                ⚡ Alta demanda ativa (simular)
              </button>
            ) : (
              <div className="ride-req-surge-active">
                <span>⚡ {surgeReason} · {surgeMultiplier.toFixed(1)}x</span>
                <button type="button" className="ride-req-surge-remove" onClick={() => { setSurgeEnabled(false); setSurgeReason(''); setSurgeMultiplier(1) }}>
                  Remover
                </button>
              </div>
            )}

            <div className="negotiation-card">
              <div className="negotiation-title">Sua proposta</div>
              <div className="negotiation-value">
                <button type="button" className="negotiation-step" onClick={() => adjustProposal(-5)}>−5</button>
                <button type="button" className="negotiation-step" onClick={() => adjustProposal(-2)}>−2</button>
                <span className="negotiation-price">{formatCurrency(effectivePrice!)}</span>
                <button type="button" className="negotiation-step" onClick={() => adjustProposal(2)}>+2</button>
                <button type="button" className="negotiation-step" onClick={() => adjustProposal(5)}>+5</button>
              </div>
              <div className="negotiation-hint">
                Mínimo {formatCurrency(effectiveMin)} — motoristas poderão aceitar ou contrapropor.
              </div>
            </div>
          </div>
        )}

        {/* Promo */}
        {estimatedPrice !== null && (
          <div className="ride-req-card">
            <div className="ride-req-card-title">Cupom de desconto</div>
            <div className="ride-req-promo">
              <input
                className="ride-req-promo-input"
                type="text"
                placeholder="Digite seu cupom"
                value={promoCode}
                onChange={e => handlePromoCodeChange(e.target.value)}
                disabled={!!promoApplied}
              />
              {promoApplied ? (
                <button
                  className="ride-req-promo-btn remove"
                  type="button"
                  onClick={() => { setPromoApplied(null); setPromoDiscount(0); setPromoError('') }}
                >
                  Remover
                </button>
              ) : (
                <button
                  className="ride-req-promo-btn"
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                >
                  {promoLoading ? '...' : 'Aplicar'}
                </button>
              )}
            </div>
            {promoApplied && (
              <div className="ride-req-promo-applied">
                <div className="ride-req-promo-ok">✓ Cupom {promoApplied.code} aplicado</div>
                <div className="ride-req-promo-row">
                  <span>Desconto</span>
                  <span className="ride-req-promo-discount">- {formatCurrency(promoDiscount)}</span>
                </div>
                <div className="ride-req-promo-row total">
                  <span>Total</span>
                  <span>{formatCurrency(promoTotal!)}</span>
                </div>
              </div>
            )}
            {promoError && <div className="ride-req-promo-error">{promoError}</div>}
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
              {estimatedPrice && <span className="ride-req-submit-price">{formatCurrency(effectivePrice!)}</span>}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
