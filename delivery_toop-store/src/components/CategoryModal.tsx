import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: any
  onSave: () => void
}

const CategoryModal = ({ isOpen, onClose, category, onSave }: CategoryModalProps) => {
  const { companyId } = useAuth()
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    icon: '',
    order: 0,
    active: true,
  })
  const [loading, setLoading] = useState(false)

  const isEdit = !!category

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '',
          order: category.order || 0,
          active: category.active !== false,
        })
      } else {
        setFormData({ name: '', description: '', icon: '', order: 0, active: true })
      }
    }
  }, [isOpen, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order: Number(formData.order || 0),
        active: formData.active,
        company: companyId,
      }
      if (isEdit) {
        await api.put(`/categories/${category._id}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      onSave()
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  if (!isOpen) return null

  const presetIcons = ['🍔', '🍕', '🥤', '🍰', '🎉', '🍣', '🧆', '🍱', '💜', '☕', '🥗', '🍜', '🌮', '🍗', '🍟', '🥩', '🥘', '🫕', '🍩', '🧁', '🍎', '🥦', '🥬', '🥕', '🧅', '🥔', '🍅', '🥭', '🍇', '🍌', '🥫', '🥛', '🧃', '🧈', '🍚', '🥩']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ex: Frutas, Bebidas, Enlatados..."
            />
          </div>
          <div className="form-group">
            <label>Descricao</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Descricao da categoria"
            />
          </div>
          <div className="form-group">
            <label>Icone (emoji)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Ex: 🍎"
              maxLength={4}
              style={{ fontSize: '1.5rem', width: '80px', textAlign: 'center' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {presetIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, icon }))}
                  style={{
                    fontSize: '1.25rem',
                    padding: '0.35rem',
                    border: formData.icon === icon ? '2px solid #667eea' : '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: formData.icon === icon ? '#f0f0ff' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Ordem</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} min={0} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
              Ativa
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner-sm" /> : <><Save size={16} /> Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal