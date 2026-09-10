import { useState, useEffect } from 'react'
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import CategoryModal from '../components/CategoryModal'

interface Category {
  _id: string
  name: string
  description?: string
  icon?: string
  order: number
  active: boolean
}

const CategoriesPage = () => {
  const { companyId } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Category | null>(null)

  useEffect(() => {
    if (companyId) loadCategories()
  }, [companyId])

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories', { params: { company: companyId } })
      const data = res.data?.data ?? res.data
      setCategories(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      console.error('Erro ao carregar categorias:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setModalOpen(true)
  }

  const handleEdit = (item: Category) => {
    setSelected(item)
    setModalOpen(true)
  }

  const handleDelete = async (item: Category) => {
    if (!window.confirm(`Desativar categoria "${item.name}"?`)) return
    try {
      await api.delete(`/categories/${item._id}`)
      loadCategories()
    } catch (e: any) {
      alert('Erro ao excluir: ' + (e.response?.data?.error || e.message))
    }
  }

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
            <Tags size={20} />
            Categorias
          </h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Icone</th>
                <th>Nome</th>
                <th>Descricao</th>
                <th>Ordem</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table">
                    Nenhuma categoria encontrada
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      {category.icon ? (
                        <span style={{ fontSize: '1.4rem' }}>{category.icon}</span>
                      ) : (
                        <div className="table-image-placeholder">
                          <Tags size={16} />
                        </div>
                      )}
                    </td>
                    <td className="td-name">{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>{category.order}</td>
                    <td>
                      <span className={`badge ${category.active ? 'badge-success' : 'badge-danger'}`}>
                        {category.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" title="Editar" onClick={() => handleEdit(category)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Excluir" onClick={() => handleDelete(category)}>
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

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selected}
        onSave={loadCategories}
      />
    </div>
  )
}

export default CategoriesPage