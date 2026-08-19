import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartButton() {
  const { itemCount, cart } = useCart()
  const navigate = useNavigate()

  if (itemCount === 0) return null

  return (
    <button className="cart-float" onClick={() => navigate('/cart')}>
      <span className="cart-float-icon">🛒</span>
      <span className="cart-float-badge">{itemCount}</span>
      <span className="cart-float-total">
        R$ {cart?.total.toFixed(2) ?? '0,00'}
      </span>
    </button>
  )
}
