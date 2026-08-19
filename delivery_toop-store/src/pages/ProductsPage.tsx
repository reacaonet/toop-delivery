import { useState, useEffect } from 'react'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import ProductModal from '../components/ProductModal'

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  promoPrice?: number
  category?: { _id: string; name: string } | string
  image?: string
  preparationTime?: number
  available: boolean
}

const ProductsPage = () => {
  const { companyId } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)

  useEffect(() => {
    if (companyId) loadProducts()
  }, [companyId])

  const loadProducts = async () => {
    try {
      const res = await api.get('/products', { params: { company: companyId } })
      const data = res.data?.data ?? res.data
      setProducts(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      console.error('Erro ao carregar produtos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setModalOpen(true)
  }

  const handleEdit = (item: Product) => {
    setSelected(item)
    setModalOpen(true)
  }

  const handleDelete = async (item: Product) => {
    if (!window.confirm(`Excluir produto "${item.name}"?`)) return
    try {
      await api.delete(`/products/${item._id}`)
      loadProducts()
    } catch (e: any) {
      alert('Erro ao excluir: ' + (e.response?.data?.error || e.message))
    }
  }

  const formatPrice = (v: number | undefined) => (v != null ? `R$ ${Number(v).toFixed(2)}` : '-')

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>
            <Package size={20} />
            Produtos
          </h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            Novo Produto
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preco</th>
                <th>Promo</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table">Nenhum produto encontrado</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt="" className="table-image" />
                      ) : (
                        <div className="table-image-placeholder">
                          <Package size={16} />
                        </div>
                      )}
                    </td>
                    <td className="td-name">{product.name}</td>
                    <td>{typeof product.category === 'object' && product.category ? product.category.name : '-'}</td>
                    <td className="td-price">{formatPrice(product.price)}</td>
                    <td className="td-promo">
                      {product.promoPrice ? (
                        <span className="promo-value">{formatPrice(product.promoPrice)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.available ? 'badge-success' : 'badge-danger'}`}>
                        {product.available ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" title="Editar" onClick={() => handleEdit(product)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Excluir" onClick={() => handleDelete(product)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selected}
        onSave={loadProducts}
      />
    </div>
  )
}

export default ProductsPage
