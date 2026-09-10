import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'

interface PaymentMethod {
  _id: string
  customer: string
  isMain: boolean
  flag: string
  cartNumber: string
  nameOnCard: string
  valid: string
  verifierCode?: string
  cardToken?: string
  documentType: string
  document: string
  gateway: string
}

const emptyForm = {
  nameOnCard: '',
  cardNumber: '',
  valid: '',
  verifierCode: '',
  document: '',
  flag: 'VISA',
}

function brandFromNumber(num: string): string {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'VISA'
  if (/^5[1-5]/.test(n)) return 'MASTERCARD'
  if (/^3[47]/.test(n)) return 'AMEX'
  if (/^6(011|5)/.test(n)) return 'DISCOVER'
  if (/^(636368|636369|438935|504175|451416|5090)/.test(n)) return 'ELO'
  if (/^3(0[0-5]|[68])/.test(n)) return 'DINERS'
  return 'OTHERS'
}

function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function formatExpiry(valid: string): string {
  if (!valid) return ''
  const d = new Date(valid)
  if (isNaN(d.getTime())) return valid
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${mm}/${String(d.getFullYear()).slice(-2)}`
}

function errorMessage(err: any): string {
  return err?.response?.data?.error || err?.response?.data?.message || 'Erro ao processar a solicitação'
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const userId = user?._id || ''

  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadCards = async () => {
    if (!userId) return
    try {
      const { data } = await api.get(`/shopping/payment-method/${userId}`)
      setCards(Array.isArray(data.data) ? data.data : [])
    } catch {
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [userId])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCardNumber = (value: string) => {
    const masked = maskCardNumber(value)
    setForm((prev) => ({
      ...prev,
      cardNumber: masked,
      flag: brandFromNumber(value),
    }))
  }

  const openNew = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const nameOnCard = form.nameOnCard.trim()
    const cardNumber = form.cardNumber.replace(/\D/g, '')
    const valid = form.valid.trim()
    const verifierCode = form.verifierCode.trim()
    const document = form.document.replace(/\D/g, '')

    if (!nameOnCard || cardNumber.length < 13 || valid.length < 5 || verifierCode.length < 3 || document.length < 11) {
      showToast('Preencha os dados do cartão corretamente (número, MM/AA, CVV e CPF)', 'error')
      return
    }

    setSaving(true)
    try {
      await api.post(`/shopping/payment-method/${userId}`, {
        nameOnCard,
        cardNumber,
        valid,
        verifierCode,
        documentType: 'CPF',
        document,
        flag: form.flag,
        isMain: cards.length === 0,
      })
      showToast('Cartão adicionado!')
      setShowForm(false)
      setForm(emptyForm)
      await loadCards()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSetMain = async (id: string) => {
    try {
      await api.put(`/shopping/payment-method/${id}`, { isMain: true })
      showToast('Cartão principal definido!')
      await loadCards()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este cartão?')) return
    try {
      await api.delete(`/shopping/payment-method/${id}`)
      showToast('Cartão removido!')
      await loadCards()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="addresses-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Meus Cartões</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          + Novo Cartão
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary, #666)', marginTop: 8 }}>
        Cartões salvos no sistema — usados no pagamento do delivery e da mobilidade.
      </p>

      {/* New card form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>
                Novo Cartão
              </h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="nameOnCard">Nome impresso no cartão *</label>
                  <input
                    id="nameOnCard"
                    type="text"
                    value={form.nameOnCard}
                    onChange={(e) => updateField('nameOnCard', e.target.value)}
                    placeholder="Ex: JOÃO DA SILVA"
                    autoComplete="cc-name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cardNumber">Número do cartão *</label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    value={form.cardNumber}
                    onChange={(e) => handleCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    autoComplete="cc-number"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="valid">Validade (MM/AA) *</label>
                    <input
                      id="valid"
                      type="text"
                      inputMode="numeric"
                      value={form.valid}
                      onChange={(e) => updateField('valid', maskExpiry(e.target.value))}
                      placeholder="12/30"
                      autoComplete="cc-exp"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="verifierCode">CVV *</label>
                    <input
                      id="verifierCode"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={form.verifierCode}
                      onChange={(e) => updateField('verifierCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      autoComplete="cc-csc"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="document">CPF do titular *</label>
                  <input
                    id="document"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={form.document}
                    onChange={(e) => updateField('document', e.target.value.replace(/\D/g, ''))}
                    placeholder="Somente números"
                    autoComplete="off"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar Cartão'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div className="loading">Carregando cartões...</div>
      ) : cards.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h2>Nenhum cartão cadastrado</h2>
          <p>Adicione um cartão para pagar no delivery e nas corridas</p>
          <button className="btn btn-primary" onClick={openNew}>
            Adicionar Cartão
          </button>
        </div>
      ) : (
        <div className="addresses-list">
          {cards.map((card) => (
            <div key={card._id} className={`address-card ${card.isMain ? 'default' : ''}`}>
              {card.isMain && <span className="address-default-badge">Principal</span>}
              <div className="address-card-content">
                <div className="address-card-label">
                  <span className="address-card-icon">💳</span>
                  <span className="address-card-name">{card.nameOnCard || 'Cartão'}</span>
                </div>
                <p className="address-card-line">
                  {card.flag} •••• {card.cartNumber}
                </p>
                <p className="address-card-line">
                  Validade {formatExpiry(card.valid)} · {card.gateway}
                </p>
              </div>
              <div className="address-card-actions">
                {!card.isMain && (
                  <button
                    className="address-action-btn"
                    onClick={() => handleSetMain(card._id)}
                  >
                    Definir principal
                  </button>
                )}
                <button
                  className="address-action-btn delete"
                  onClick={() => handleDelete(card._id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}