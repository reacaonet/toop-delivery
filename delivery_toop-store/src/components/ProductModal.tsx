import { useState, useEffect, useRef } from 'react'
import { X, Save, Upload } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any
  onSave: () => void
}

const ProductModal = ({ isOpen, onClose, product, onSave }: ProductModalProps) => {
  const { companyId } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    category: '',
    image: '',
    preparationTime: '',
    available: true,
  })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!product

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          promoPrice: product.promoPrice ?? '',
          category: product.category?._id || product.category || '',
          image: product.image || '',
          preparationTime: product.preparationTime ?? '',
          available: product.available !== false,
        })
        setImagePreview(product.image || '')
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          promoPrice: '',
          category: '',
          image: '',
          preparationTime: '',
          available: true,
        })
        setImagePreview('')
      }
      loadCategories()
    }
  }, [isOpen, product])

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/public')
      const data = res.data?.data ?? res.data
      setCategories(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (url) {
        setFormData((prev) => ({ ...prev, image: url }))
        setImagePreview(url)
      }
    } catch (err: any) {
      alert('Erro ao enviar imagem: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        company: companyId,
        price: Number(formData.price),
        promoPrice: formData.promoPrice ? Number(formData.promoPrice) : undefined,
        preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined,
      }
      if (isEdit) {
        await api.put(`/products/${product._id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      onSave()
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
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
              placeholder="Nome do produto"
            />
          </div>

          <div className="form-group">
            <label>Descricao</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Descricao do produto"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Preco (R$) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min={0}
                step={0.01}
              />
            </div>
            <div className="form-group">
              <label>Promo (R$)</label>
              <input
                type="number"
                name="promoPrice"
                value={formData.promoPrice}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
            </div>
            <div className="form-group">
              <label>Tempo Prep. (min)</label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Imagem</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div className="image-upload-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={16} />
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
              </button>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              )}
            </div>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Ou cole a URL da imagem"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
              Disponivel
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

export default ProductModal
