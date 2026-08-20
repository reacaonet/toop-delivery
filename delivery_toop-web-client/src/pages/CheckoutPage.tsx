import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

interface SavedAddress {
  id: string
  label: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'debit_card', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'cash', label: 'Dinheiro', icon: '💵' },
]

function loadAddresses(userId: string): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(`deliveryAddresses_${userId}`) || '[]')
  } catch {
    return []
  }
}

export default function CheckoutPage() {
  const { cart, companyId, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showAddressPicker, setShowAddressPicker] = useState(false)

  useEffect(() => {
    const addrs = loadAddresses(user?._id || '')
    setAddresses(addrs)
    const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0]
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id)
    }
  }, [])

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!cart || !companyId || !user) return

    if (!selectedAddress) {
      showToast('Adicione um endereço de entrega', 'error')
      navigate('/addresses')
      return
    }

    setSubmitting(true)
    try {
      const orderData = {
        company: companyId,
        customer: user._id,
        items: cart.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        paymentMethod,
        deliveryAddress: {
          street: selectedAddress.street,
          number: selectedAddress.number,
          complement: selectedAddress.complement,
          neighborhood: selectedAddress.neighborhood,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
        },
        notes: notes || undefined,
      }
      const { data } = await api.post('/orders', orderData)
      clearCart()
      navigate(`/orders/${data.data._id}`)
    } catch {
      setSubmitting(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Carrinho vazio</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Ir às compras
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/cart')}>
        ← Voltar ao carrinho
      </button>

      <h1 className="page-title">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-form">
          {/* Address section */}
          <section className="checkout-section">
            <h2>
              <span className="section-icon">📍</span>
              Endereço de Entrega
            </h2>

            {addresses.length === 0 ? (
              <div className="checkout-no-address">
                <p>Você ainda não tem endereços salvos</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/addresses')}
                >
                  Adicionar endereço
                </button>
              </div>
            ) : selectedAddress ? (
              <div className="checkout-address-card" onClick={() => setShowAddressPicker(true)}>
                <div className="checkout-address-info">
                  <div className="checkout-address-label">
                    <span className="checkout-address-icon">
                      {selectedAddress.label?.toLowerCase().includes('trabalho') ? '🏢' :
                       selectedAddress.label?.toLowerCase().includes('casa') ? '🏠' : '📍'}
                    </span>
                    <span className="checkout-address-name">
                      {selectedAddress.label || 'Endereço'}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="checkout-address-default">Principal</span>
                    )}
                  </div>
                  <p className="checkout-address-line">
                    {selectedAddress.street}, {selectedAddress.number}
                    {selectedAddress.complement && ` - ${selectedAddress.complement}`}
                  </p>
                  <p className="checkout-address-line">
                    {selectedAddress.neighborhood} - {selectedAddress.city}/{selectedAddress.state}
                  </p>
                </div>
                <span className="checkout-address-change">Trocar ›</span>
              </div>
            ) : null}
          </section>

          {/* Payment section */}
          <section className="checkout-section">
            <h2>
              <span className="section-icon">💳</span>
              Forma de Pagamento
            </h2>
            <div className="payment-options">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.value}
                  className={`payment-option ${paymentMethod === pm.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">{pm.icon}</span>
                  {pm.label}
                </label>
              ))}
            </div>
          </section>

          {/* Notes section */}
          <section className="checkout-section">
            <h2>
              <span className="section-icon">📝</span>
              Observações
            </h2>
            <div className="form-group">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instruções especiais para a entrega, ex: troco, rangos sem cebola..."
                rows={3}
              />
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="cart-summary">
          <h2>Resumo</h2>
          <div className="checkout-items">
            {cart.items.map((item) => (
              <div key={item._id} className="checkout-item">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>R$ {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>R$ {cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Frete</span>
            <span>
              {cart.deliveryFee > 0 ? `R$ ${cart.deliveryFee.toFixed(2)}` : 'Grátis'}
            </span>
          </div>
          {cart.discount > 0 && (
            <div className="cart-summary-row discount">
              <span>Desconto</span>
              <span>- R$ {cart.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>R$ {cart.total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            className="cart-checkout-btn"
            disabled={submitting || !selectedAddress}
          >
            {submitting ? 'Confirmando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>

      {/* Address picker modal */}
      {showAddressPicker && (
        <div className="modal-overlay" onClick={() => setShowAddressPicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddressPicker(false)}>✕</button>
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>
                Escolher endereço de entrega
              </h2>
              <div className="address-picker-list">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    className={`address-picker-item ${addr.id === selectedAddressId ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAddressId(addr.id)
                      setShowAddressPicker(false)
                    }}
                  >
                    <div className="address-picker-icon">
                      {addr.label?.toLowerCase().includes('trabalho') ? '🏢' :
                       addr.label?.toLowerCase().includes('casa') ? '🏠' : '📍'}
                    </div>
                    <div className="address-picker-info">
                      <span className="address-picker-name">
                        {addr.label || 'Endereço'}
                        {addr.isDefault && <span className="address-picker-badge">Principal</span>}
                      </span>
                      <span className="address-picker-detail">
                        {addr.street}, {addr.number} - {addr.neighborhood}, {addr.city}/{addr.state}
                      </span>
                    </div>
                    {addr.id === selectedAddressId && <span className="address-picker-check">✓</span>}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setShowAddressPicker(false)
                  navigate('/addresses')
                }}
              >
                Gerenciar endereços
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
