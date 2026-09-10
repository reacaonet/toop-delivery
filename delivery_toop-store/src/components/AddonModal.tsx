import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface AddonModalProps {
  isOpen: boolean
  onClose: () => void
  addon?: any
  onSave: () => void
}

const AddonModal = ({ isOpen, onClose, addon, onSave }: AddonModalProps) => {
  const { companyId } = useAuth()
  const [formData, setFormData] = useState<any>({ name: '', price: '', active: true })
  const [loading, setLoading] = useState(false)

  const isEdit = !!addon

  useEffect(() => {
    if (isOpen) {
      if (addon) {
        setFormData({
          name: addon.name || '',
          price: addon.price ?? '',
          active: addon.active !== false,
        })
      } else {
        setFormData({ name: '', price: '', active: true })
      }
    }
  }, [isOpen, addon])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price || 0),
        active: formData.active,
        company: companyId,
      }
      if (isEdit) {
        await api.put(`/addons/${addon._id}`, payload)
      } else {
        await api.post('/addons', payload)
      }
      onSave()
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Acompanhamento' : 'Novo Acompanhamento'}</h3>
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
              placeholder="Ex: Borda de catupiry, Cheddar, Mais mussarela..."
            />
          </div>
          <div className="form-group">
            <label>Valor adicional (R$) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min={0}
              step={0.01}
              placeholder="0,00"
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
              Ativo
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

export default AddonModal