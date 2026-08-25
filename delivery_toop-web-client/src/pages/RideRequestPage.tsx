import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

const SERVICE_OPTIONS = [
  { value: 'driver', label: 'Corrida', icon: '🚗', description: 'Transporte de passageiros' },
  { value: 'delivery', label: 'Entrega', icon: '📦', description: 'Entrega de documentos/pacotes' },
  { value: 'package', label: 'Pacote', icon: '📮', description: 'Envio de pacotes' },
]

export default function RideRequestPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showToast } = useToast()

  const [serviceCategory, setServiceCategory] = useState('driver')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupComplement, setPickupComplement] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [dropoffComplement, setDropoffComplement] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pickupLat, setPickupLat] = useState(-23.5505)
  const [pickupLng, setPickupLng] = useState(-46.6333)
  const [dropoffLat, setDropoffLat] = useState(-23.5600)
  const [dropoffLng, setDropoffLng] = useState(-46.6400)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupLat(pos.coords.latitude)
          setPickupLng(pos.coords.longitude)
        },
        () => {}
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      showToast('Preencha os endereços de origem e destino', 'error')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/bookings', {
        serviceCategory,
        pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng, complement: pickupComplement || undefined },
        dropoff: { address: dropoffAddress, lat: dropoffLat, lng: dropoffLng, complement: dropoffComplement || undefined },
        paymentMethod,
        notes: notes || undefined,
      })
      const booking = data.data
      showToast('Corrida solicitada com sucesso!', 'success')
      navigate(`/rides/${booking._id}`)
    } catch (error: any) {
      showToast('Erro ao solicitar corrida: ' + (error.response?.data?.error || error.message), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
      <h1 className="page-title">Solicitar Corrida</h1>

      <div className="ride-layout">
        <div className="ride-form">
          <section className="checkout-section">
            <h2><span className="section-icon">🚗</span> Tipo de Serviço</h2>
            <div className="service-options">
              {SERVICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`service-option ${serviceCategory === opt.value ? 'selected' : ''}`}
                  onClick={() => setServiceCategory(opt.value)}
                >
                  <span className="service-option-icon">{opt.icon}</span>
                  <div>
                    <strong>{opt.label}</strong>
                    <span className="service-option-desc">{opt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <section className="checkout-section">
              <h2><span className="section-icon">📍</span> Origem</h2>
              <div className="form-group">
                <label>Endereço de Coleta *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Apto 101, Bloco B..."
                  value={pickupComplement}
                  onChange={e => setPickupComplement(e.target.value)}
                />
              </div>
            </section>

            <section className="checkout-section">
              <h2><span className="section-icon">🏁</span> Destino</h2>
              <div className="form-group">
                <label>Endereço de Destino *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                  value={dropoffAddress}
                  onChange={e => setDropoffAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Sala 502, 5o andar..."
                  value={dropoffComplement}
                  onChange={e => setDropoffComplement(e.target.value)}
                />
              </div>
            </section>

            <section className="checkout-section">
              <h2><span className="section-icon">💳</span> Pagamento</h2>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <div className="payment-methods">
                  {[
                    { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
                    { value: 'debit_card', label: 'Cartão de Débito', icon: '💳' },
                    { value: 'cash', label: 'Dinheiro', icon: '💵' },
                    { value: 'pix', label: 'PIX', icon: '📱' },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      className={`payment-method-btn ${paymentMethod === m.value ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      <span>{m.icon}</span> {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h2><span className="section-icon">📝</span> Observações</h2>
              <div className="form-group">
                <textarea
                  className="form-input"
                  placeholder="Alguma observação para o motorista?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </section>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={submitting}
            >
              {submitting ? 'Solicitando...' : 'Solicitar Corrida'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
