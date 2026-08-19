import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api'
import CartButton from '../components/CartButton'

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
  const [company, setCompany] = useState<Company | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

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
        if (Array.isArray(raw)) {
          cats = raw
        } else if (Array.isArray(raw?.data)) {
          cats = raw.data
        } else if (Array.isArray(raw?.data?.data)) {
          cats = raw.data.data
        }
        setCategories(cats)
        if (cats.length > 0) {
          setSelectedCategory(cats[0]._id)
        }
      } catch (err) {
        console.error('[CompanyPage] load error:', err)
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
        if (Array.isArray(raw)) {
          prods = raw
        } else if (Array.isArray(raw?.data)) {
          prods = raw.data
        } else if (Array.isArray(raw?.data?.data)) {
          prods = raw.data.data
        }
        setProducts(prods)
      } else {
        const { data } = await api.get(`/products/company/${id}`)
        const raw = data
        let prods: Product[] = []
        if (Array.isArray(raw)) {
          prods = raw
        } else if (Array.isArray(raw?.data)) {
          prods = raw.data
        } else if (Array.isArray(raw?.data?.data)) {
          prods = raw.data.data
        }
        setProducts(prods)
      }
    } catch {
      setProducts([])
    }
  }, [id, selectedCategory])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleAddToCart = async (product: Product) => {
    if (!id) return
    if (companyId && companyId !== id) {
      if (!window.confirm('Adicionar itens de outra loja limpará o carrinho atual. Continuar?')) return
    }
    setAddingId(product._id)
    try {
      setCompanyId(id)
      await addItem(id, product._id, 1)
    } catch {
      // handle silently
    } finally {
      setAddingId(null)
    }
  }

  if (loading) return <div className="loading">Carregando...</div>
  if (!company) return <div className="empty-state">Loja não encontrada</div>

  return (
    <div className="page">
      <div className="company-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <div className="company-header-info">
          <div className="company-header-logo">
            {company.logo ? (
              <img src={company.logo} alt={company.name} />
            ) : (
              <span className="logo-placeholder large">{company.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1>{company.name}</h1>
            <p className="company-header-desc">{company.description}</p>
            <div className="company-header-meta">
              <span className="rating">★ {company.rating?.toFixed(1) ?? '0.0'}</span>
              <span>•</span>
              <span>{company.estimatedDeliveryTime}</span>
              <span>•</span>
              <span>
                {company.deliveryFee > 0
                  ? `Frete R$ ${company.deliveryFee.toFixed(2)}`
                  : 'Frete grátis'}
              </span>
              <span>•</span>
              <span>Pedido mín. R$ {company.minimumOrder?.toFixed(2) ?? '0,00'}</span>
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
          <div className="empty-state">Nenhum produto nesta categoria</div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">🍽️</div>
                )}
              </div>
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
                  className="btn btn-primary btn-add"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingId === product._id || !product.available}
                >
                  {!product.available
                    ? 'Indisponível'
                    : addingId === product._id
                      ? 'Adicionando...'
                      : 'Adicionar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CartButton />
    </div>
  )
}
