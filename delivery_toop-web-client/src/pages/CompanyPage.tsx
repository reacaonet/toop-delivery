import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import api from '../api'
import CartButton from '../components/CartButton'
import ProductModal from '../components/ProductModal'

interface Company {
  _id: string
  name: string
  description: string
  logo: string
  category: string
  deliveryFee: number
  minimumOrder: number
  estimatedDeliveryTime: string
  rating: number
  address: { street: string; number: string; city: string; state: string }
}

interface Category {
  _id: string
  name: string
  description: string
  company: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  promoPrice: number
  image: string
  preparationTime: string
  active: boolean
  available: boolean
}

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, companyId, setCompanyId } = useCart()
  const { showToast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addingLoading, setAddingLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const [companyRes, categoriesRes] = await Promise.all([
          api.get(`/companies/${id}`),
          api.get('/categories', { params: { company: id } }),
        ])
        setCompany(companyRes.data.data)
        const raw = categoriesRes.data
        let cats: Category[] = []
        if (Array.isArray(raw)) cats = raw
        else if (Array.isArray(raw?.data)) cats = raw.data
        else if (Array.isArray(raw?.data?.data)) cats = raw.data.data
        setCategories(cats)
        if (cats.length > 0) setSelectedCategory(cats[0]._id)
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const loadProducts = useCallback(async () => {
    if (!id) return
    try {
      if (selectedCategory) {
        const { data } = await api.get('/products', {
          params: { company: id, category: selectedCategory },
        })
        const raw = data
        let prods: Product[] = []
        if (Array.isArray(raw)) prods = raw
        else if (Array.isArray(raw?.data)) prods = raw.data
        else if (Array.isArray(raw?.data?.data)) prods = raw.data.data
        setProducts(prods)
      } else {
        const { data } = await api.get(`/products/company/${id}`)
        const raw = data
        let prods: Product[] = []
        if (Array.isArray(raw)) prods = raw
        else if (Array.isArray(raw?.data)) prods = raw.data
        else if (Array.isArray(raw?.data?.data)) prods = raw.data.data
        setProducts(prods)
      }
    } catch {
      setProducts([])
    }
  }, [id, selectedCategory])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleAddClick = (product: Product) => {
    if (!product.available) return
    if (companyId && companyId !== id) {
      if (!window.confirm('Adicionar itens de outra loja limpará o carrinho atual. Continuar?')) return
    }
    setSelectedProduct(product)
  }

  const handleConfirmAdd = async (quantity: number, notes: string) => {
    if (!id || !selectedProduct) return
    setAddingLoading(true)
    try {
      setCompanyId(id)
      await addItem(id, selectedProduct._id, quantity, notes || undefined)
      showToast(`${selectedProduct.name} adicionado ao carrinho!`)
      setSelectedProduct(null)
    } catch {
      showToast('Erro ao adicionar item', 'error')
    } finally {
      setAddingLoading(false)
    }
  }

  if (loading) return <div className="loading">Carregando restaurante...</div>
  if (!company) return <div className="empty-state">Loja não encontrada</div>

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="company-header">
        <div className="company-banner">
          <div className="company-banner-info">
            <div className="company-header-logo">
              {company.logo ? (
                <img src={company.logo} alt={company.name} />
              ) : (
                <span className="logo-placeholder">{company.name.charAt(0)}</span>
              )}
            </div>
            <div className="company-header-text">
              <h1>{company.name}</h1>
              <p className="company-header-desc">{company.description}</p>
              <div className="company-header-meta">
                <span className="meta-item">★ {company.rating?.toFixed(1) ?? '0.0'}</span>
                <span className="meta-item">⏱ {company.estimatedDeliveryTime}</span>
                <span className="meta-item">
                  {company.deliveryFee > 0
                    ? `Frete R$ ${company.deliveryFee.toFixed(2)}`
                    : 'Frete grátis'}
                </span>
                <span className="meta-item">
                  Mín. R$ {company.minimumOrder?.toFixed(2) ?? '0,00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-tab ${selectedCategory === cat._id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h2>Nenhum produto nesta categoria</h2>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-card-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-pricing">
                  {product.promoPrice && product.promoPrice < product.price ? (
                    <>
                      <span className="product-price-old">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className="product-price promo">
                        R$ {product.promoPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="product-price">R$ {product.price.toFixed(2)}</span>
                  )}
                </div>
                {product.preparationTime && (
                  <span className="preparation-time">⏱ {product.preparationTime}</span>
                )}
                <button
                  className="product-add-btn"
                  onClick={() => handleAddClick(product)}
                  disabled={!product.available}
                >
                  {!product.available ? 'Indisponível' : 'Adicionar'}
                </button>
              </div>
              <div className="product-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">🍽️</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CartButton />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onConfirm={handleConfirmAdd}
          onClose={() => setSelectedProduct(null)}
          loading={addingLoading}
        />
      )}
    </div>
  )
}
