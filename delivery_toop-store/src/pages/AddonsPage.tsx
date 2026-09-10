import { useState, useEffect } from 'react'
import { Plus, Pizza, Pencil, Trash2 } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import AddonModal from '../components/AddonModal'

interface Addon {
  _id: string
  name: string
  price: number
  active: boolean
}

const AddonsPage = () => {
  const { companyId } = useAuth()
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Addon | null>(null)

  useEffect(() => {
    if (companyId) loadAddons()
  }, [companyId])

  const loadAddons = async () => {
    try {
      const res = await api.get('/addons', { params: { company: companyId } })
      const data = res.data?.data ?? res.data
      setAddons(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      console.error('Erro ao carregar acompanhamentos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setModalOpen(true)
  }

  const handleEdit = (item: Addon) => {
    setSelected(item)
    setModalOpen(true)
  }

  const handleDelete = async (item: Addon) => {
    if (!window.confirm(`Remover acompanhamento "${item.name}"?`)) return
    try {
      await api.delete(`/addons/${item._id}`)
      loadAddons()
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
            <Pizza size={20} />
            Acompanhamentos
          </h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            Novo Acompanhamento
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {addons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-table">
                    Nenhum acompanhamento criado. Depois escolha quais valem para cada produto.
                  </td>
                </tr>
              ) : (
                addons.map((addon) => (
                  <tr key={addon._id}>
                    <td className="td-name">{addon.name}</td>
                    <td>{formatPrice(addon.price)}</td>
                    <td>
                      <span className={`badge ${addon.active ? 'badge-success' : 'badge-danger'}`}>
                        {addon.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" title="Editar" onClick={() => handleEdit(addon)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Excluir" onClick={() => handleDelete(addon)}>
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

      <AddonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        addon={selected}
        onSave={loadAddons}
      />
    </div>
  )
}

export default AddonsPage