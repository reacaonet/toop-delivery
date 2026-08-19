import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart()
  const navigate = useNavigate()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione itens de uma loja para começar</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Explorar restaurantes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Meu Carrinho</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">R$ {item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item-total">R$ {item.total.toFixed(2)}</span>
                <button className="btn-remove" onClick={() => removeItem(item._id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumo do Pedido</h2>
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
            className="cart-checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Finalizar Pedido →
          </button>
        </div>
      </div>
    </div>
  )
}
