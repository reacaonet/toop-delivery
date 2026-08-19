import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartButton() {
  const { itemCount } = useCart()
  const navigate = useNavigate()

  if (itemCount === 0) return null

  return (
    <button className="cart-float" onClick={() => navigate('/cart')}>
      <span className="cart-float-icon">🛒</span>
      <span className="cart-float-badge">{itemCount}</span>
    </button>
  )
}
