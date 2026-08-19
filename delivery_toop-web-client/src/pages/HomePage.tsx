import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

interface Company {
  _id: string
  name: string
  category: string
  logo: string
  description: string
  deliveryFee: number
  minimumOrder: number
  estimatedDeliveryTime: string
  rating: number
  totalOrders: number
  tags: string[]
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  promoPrice: number
  image: string
  company: string | { _id: string; name: string }
}

interface Order {
  _id: string
  orderNumber: number
  createdAt: string
  total: number
  status: string
  company: { name: string; _id: string; logo: string } | string
  items: Array<{ name: string; quantity: number; total: number }>
}

const categoryIcons: Record<string, string> = {
  'Lanches': '🍔',
  'Pizzas': '🍕',
  'Bebidas': '🥤',
  'Doces': '🍰',
  'Combos': '🎉',
  'Japonesa': '🍣',
  'Árabe': '🧆',
  'Marmita': '🍱',
  'Açaí': '💜',
  'Café': '☕',
}

const defaultCategories = ['Todos', 'Lanches', 'Pizzas', 'Bebidas', 'Doces', 'Combos', 'Japonesa', 'Açaí']

const banners = [
  { title: 'Frete Grátis', subtitle: 'Em pedidos acima de R$ 39,90', gradient: 'linear-gradient(135deg, #EA1D2C, #D41925)', icon: '🚚' },
  { title: '50% OFF', subtitle: 'No seu primeiro pedido', gradient: 'linear-gradient(135deg, #7B2FF7, #5B1FD4)', icon: '🎉' },
  { title: 'Super Combos', subtitle: 'Aproveite promoções imperdíveis', gradient: 'linear-gradient(135deg, #F5A623, #E8941C)', icon: '🔥' },
]

function getCompanyId(c: Company | Order): string {
  return typeof c === 'object' && '_id' in c ? c._id : ''
}

function getCompanyName(c: Company | { name: string } | string): string {
  if (typeof c === 'string') return c
  if (typeof c === 'object' && 'name' in c) return c.name
  return ''
}

function getCompanyLogo(c: { logo?: string } | string): string {
  if (typeof c === 'string') return ''
  if (typeof c === 'object' && 'logo' in c) return (c as { logo?: string }).logo ?? ''
  return ''
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favCompanies')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [companiesRes, productsRes] = await Promise.all([
          api.get('/companies', { params: { page: 1, limit: 50 } }),
          api.get('/products', { params: { page: 1, limit: 200 } }),
        ])
        const cData = companiesRes.data.data
        setCompanies(Array.isArray(cData) ? cData : cData?.data ?? [])

        const pData = productsRes.data.data
        setAllProducts(Array.isArray(pData) ? pData : pData?.data ?? [])
      } catch {
        // handle silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadRecent() {
      try {
        const { data } = await api.get('/orders', { params: { page: 1, limit: 3 } })
        const oData = data.data
        setRecentOrders(Array.isArray(oData) ? oData : oData?.data ?? [])
      } catch {
        // not logged in or no orders
      }
    }
    loadRecent()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const toggleFavorite = useCallback((e: React.MouseEvent, companyId: string) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(companyId)) {
        next.delete(companyId)
      } else {
        next.add(companyId)
      }
      localStorage.setItem('favCompanies', JSON.stringify([...next]))
      return next
    })
  }, [])

  const filtered = useMemo(() => {
    let result = companies

    if (selectedCategory && selectedCategory !== 'Todos') {
      result = result.filter(
        (c) => c.category?.toLowerCase().includes(selectedCategory.toLowerCase()),
      )
    }

    if (search) {
      const q = search.toLowerCase()

      const matchedCompanyIds = new Set<string>()

      companies.forEach((c) => {
        if (
          c.name.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
        ) {
          matchedCompanyIds.add(c._id)
        }
      })

      allProducts.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
          const compId = typeof p.company === 'string' ? p.company : p.company?._id
          if (compId) matchedCompanyIds.add(compId)
        }
      })

      result = result.filter((c) => matchedCompanyIds.has(c._id))
    }

    return result
  }, [companies, allProducts, search, selectedCategory])

  return (
    <div className="page">
      {/* Address bar */}
      <div className="address-bar">
        <span className="address-icon">📍</span>
        <div className="address-text">
          <span className="address-label">Entregar em</span>
          <span className="address-value">Endereço atual</span>
        </div>
        <span className="address-arrow">▼</span>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por loja, pizza, hambúrguer, sushi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category carousel */}
      <div className="category-carousel">
        {defaultCategories.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <span className="category-chip-icon">
              {cat === 'Todos' ? '🔥' : categoryIcons[cat] || '📁'}
            </span>
            <span className="category-chip-label">{cat}</span>
          </button>
        ))}
      </div>

      {/* Promotional banners */}
      {!search && selectedCategory === 'Todos' && (
        <div className="banner-carousel">
          {banners.map((banner, i) => (
            <div
              key={i}
              className={`banner-slide ${i === currentBanner ? 'active' : ''}`}
              style={{ background: banner.gradient }}
            >
              <div className="banner-content">
                <div>
                  <h3 className="banner-title">{banner.title}</h3>
                  <p className="banner-subtitle">{banner.subtitle}</p>
                </div>
                <span className="banner-icon">{banner.icon}</span>
              </div>
            </div>
          ))}
          <div className="banner-dots">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`banner-dot ${i === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {!search && recentOrders.length > 0 && selectedCategory === 'Todos' && (
        <div className="recent-orders-section">
          <h2 className="section-title">Seus últimos pedidos</h2>
          <div className="recent-orders-scroll">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="recent-order-card"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="recent-order-logo">
                  {getCompanyLogo(order.company) ? (
                    <img src={getCompanyLogo(order.company)} alt="" />
                  ) : (
                    <span className="logo-placeholder" style={{ fontSize: '1.2rem' }}>
                      {getCompanyName(order.company).charAt(0)}
                    </span>
                  )}
                </div>
                <div className="recent-order-info">
                  <span className="recent-order-name">{getCompanyName(order.company)}</span>
                  <span className="recent-order-items">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <button
                  className="recent-order-reorder"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/company/${getCompanyId(order.company)}`)
                  }}
                >
                  Pedir novamente
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restaurants */}
      {loading ? (
        <div className="loading">Carregando restaurantes...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>Nenhum resultado encontrado</h2>
          <p>
            {search
              ? `Não encontramos "${search}" em lojas ou cardápios`
              : 'Tente buscar por outro termo ou categoria'}
          </p>
        </div>
      ) : (
        <>
          <h2 className="section-title">
            {search
              ? `Resultados para "${search}"`
              : selectedCategory === 'Todos'
                ? 'Restaurantes'
                : selectedCategory}
          </h2>
          <div className="company-grid">
            {filtered.map((company) => (
              <div
                key={company._id}
                className="company-card"
                onClick={() => navigate(`/company/${company._id}`)}
              >
                <div className="company-card-logo">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} />
                  ) : (
                    <span className="logo-placeholder">{company.name.charAt(0)}</span>
                  )}
                </div>
                <div className="company-card-info">
                  <h3>{company.name}</h3>
                  <p className="company-category">{company.category}</p>
                  <div className="company-meta">
                    <span className="rating">★ {company.rating?.toFixed(1) ?? '0.0'}</span>
                    <span className="dot" />
                    <span className="delivery-time">{company.estimatedDeliveryTime}</span>
                    <span className="dot" />
                    <span className="delivery-fee">
                      {company.deliveryFee > 0
                        ? `Frete R$ ${company.deliveryFee.toFixed(2)}`
                        : 'Grátis'}
                    </span>
                  </div>
                  {company.tags && company.tags.length > 0 && (
                    <div className="company-tags">
                      {company.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`company-fav-btn ${favorites.has(company._id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, company._id)}
                >
                  {favorites.has(company._id) ? '❤️' : '🤍'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
