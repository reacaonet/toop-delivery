import { useState } from 'react'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  promoPrice: number
  image: string
  preparationTime: string
}

interface ProductModalProps {
  product: Product
  onConfirm: (quantity: number, notes: string) => void
  onClose: () => void
  loading?: boolean
}

export default function ProductModal({ product, onConfirm, onClose, loading }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const hasPromo = product.promoPrice && product.promoPrice < product.price
  const unitPrice = hasPromo ? product.promoPrice : product.price
  const total = unitPrice * quantity

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="modal-product-placeholder">🍽️</div>
          )}
        </div>

        <div className="modal-product-info">
          <h2>{product.name}</h2>
          <p className="modal-product-desc">{product.description}</p>
          {product.preparationTime && (
            <span className="modal-product-time">⏱ {product.preparationTime} de preparo</span>
          )}
          <div className="modal-product-price">
            {hasPromo && (
              <span className="product-price-old">R$ {product.price.toFixed(2)}</span>
            )}
            <span className={`product-price ${hasPromo ? 'promo' : ''}`}>
              R$ {unitPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="modal-quantity-section">
          <p className="modal-section-label">Quantidade</p>
          <div className="modal-quantity-controls">
            <button
              className="modal-qty-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="modal-qty-value">{quantity}</span>
            <button
              className="modal-qty-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="modal-notes-section">
          <p className="modal-section-label">Observações</p>
          <textarea
            className="modal-notes-input"
            placeholder="Ex: sem cebola, mais molho, ponto da carne..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="modal-confirm-btn"
          onClick={() => onConfirm(quantity, notes)}
          disabled={loading}
        >
          {loading ? 'Adicionando...' : `Adicionar · R$ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
