import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'

interface Address {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'debit_card', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'cash', label: 'Dinheiro', icon: '💵' },
]

export default function CheckoutPage() {
  const { cart, companyId, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!cart || !companyId || !user) return

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
        total: cart.total,
        paymentMethod,
        deliveryAddress: address,
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
          <section className="checkout-section">
            <h2>
              <span className="section-icon">📍</span>
              Endereço de Entrega
            </h2>
            <div className="form-row">
              <div className="form-group flex-3">
                <label htmlFor="street">Rua</label>
                <input
                  id="street"
                  type="text"
                  value={address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="number">Nº</label>
                <input
                  id="number"
                  type="text"
                  value={address.number}
                  onChange={(e) => updateAddress('number', e.target.value)}
                  placeholder="Nº"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="complement">Complemento</label>
                <input
                  id="complement"
                  type="text"
                  value={address.complement}
                  onChange={(e) => updateAddress('complement', e.target.value)}
                  placeholder="Apto, bloco..."
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="neighborhood">Bairro</label>
                <input
                  id="neighborhood"
                  type="text"
                  value={address.neighborhood}
                  onChange={(e) => updateAddress('neighborhood', e.target.value)}
                  placeholder="Bairro"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="city">Cidade</label>
                <input
                  id="city"
                  type="text"
                  value={address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="Cidade"
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="state">Estado</label>
                <input
                  id="state"
                  type="text"
                  value={address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  required
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="zipCode">CEP</label>
                <input
                  id="zipCode"
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => updateAddress('zipCode', e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>
          </section>

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
                placeholder="Instruções especiais para a entrega,ex: troco, rangos sem cebola..."
                rows={3}
              />
            </div>
          </section>
        </div>

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
            disabled={submitting}
          >
            {submitting ? 'Confirmando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
