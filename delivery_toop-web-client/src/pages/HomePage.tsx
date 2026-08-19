import { useEffect, useState, useMemo } from 'react'
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

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/companies', { params: { page: 1, limit: 50 } })
        const companiesPaginated = data.data
        setCompanies(Array.isArray(companiesPaginated) ? companiesPaginated : companiesPaginated?.data ?? [])
      } catch {
        // handle silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return companies
    const q = search.toLowerCase()
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q)),
    )
  }, [companies, search])

  return (
    <div className="page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar loja ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Nenhuma loja encontrada</div>
      ) : (
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
                  <span className="delivery-time">{company.estimatedDeliveryTime}</span>
                  <span className="delivery-fee">
                    {company.deliveryFee > 0
                      ? `Frete R$ ${company.deliveryFee.toFixed(2)}`
                      : 'Frete grátis'}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
