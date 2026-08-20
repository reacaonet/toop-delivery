import { useState, useEffect, useRef } from 'react'
import { Settings, Save, Upload, Image as ImageIcon } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface CompanyData {
  _id: string
  name: string
  cnpj?: string
  phone?: string
  email?: string
  description?: string
  logo?: string
  category?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  deliveryFee?: number
  minimumOrder?: number
  estimatedDeliveryTime?: number
  openingHours?: Record<string, { open: string; close: string }>
  active?: boolean
}

const DAYS_PT: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terca-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sabado',
  sunday: 'Domingo',
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const SettingsPage = () => {
  const { companyId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string; icon?: string }[]>([])
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    description: '',
    category: '',
    logo: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryFee: '',
    minimumOrder: '',
    estimatedDeliveryTime: '',
  })

  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(() => {
    const initial: Record<string, { open: string; close: string; closed: boolean }> = {}
    DAYS_ORDER.forEach((day) => {
      initial[day] = { open: '09:00', close: '22:00', closed: false }
    })
    return initial
  })

  useEffect(() => {
    if (companyId) {
      loadCompany()
      loadCategories()
    }
  }, [companyId])

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/public')
      const data = res.data?.data ?? res.data
      setCategories(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      console.error('Erro ao carregar categorias:', e)
    }
  }

  const loadCompany = async () => {
    try {
      const res = await api.get(`/companies/${companyId}`)
      const data = res.data?.data ?? res.data
      setFormData({
        name: data.name || '',
        cnpj: data.cnpj || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        category: data.category || '',
        logo: data.logo || '',
        street: data.address?.street || '',
        number: data.address?.number || '',
        complement: data.address?.complement || '',
        neighborhood: data.address?.neighborhood || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipCode: data.address?.zipCode || '',
        deliveryFee: data.deliveryFee ?? '',
        minimumOrder: data.minimumOrder ?? '',
        estimatedDeliveryTime: data.estimatedDeliveryTime ?? '',
      })
      if (data.openingHours) {
        const hours: Record<string, { open: string; close: string; closed: boolean }> = {}
        DAYS_ORDER.forEach((day) => {
          const h = data.openingHours[day]
          if (h) {
            hours[day] = { open: h.open || '09:00', close: h.close || '22:00', closed: false }
          } else {
            hours[day] = { open: '09:00', close: '22:00', closed: true }
          }
        })
        setOpeningHours(hours)
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (url) {
        setFormData((prev) => ({ ...prev, logo: url }))
      }
    } catch (err: any) {
      alert('Erro ao enviar logo: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleDayToggle = (day: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    try {
      const oh: Record<string, { open: string; close: string }> = {}
      Object.entries(openingHours).forEach(([day, val]) => {
        if (!val.closed) {
          oh[day] = { open: val.open, close: val.close }
        }
      })
      const payload = {
        name: formData.name,
        cnpj: formData.cnpj,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        category: formData.category,
        logo: formData.logo,
        address: {
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        deliveryFee: formData.deliveryFee ? Number(formData.deliveryFee) : 0,
        minimumOrder: formData.minimumOrder ? Number(formData.minimumOrder) : 0,
        estimatedDeliveryTime: formData.estimatedDeliveryTime ? Number(formData.estimatedDeliveryTime) : undefined,
        openingHours: oh,
      }
      await api.put(`/companies/${companyId}`, payload)
      alert('Configuracoes salvas com sucesso!')
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
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
            <Settings size={20} />
            Configuracoes da Loja
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Dados da Loja</h4>

            <div className="form-group">
              <label>Logo da Loja</label>
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <div className="logo-upload-row">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="logo-preview" />
                ) : (
                  <div className="logo-preview logo-placeholder">
                    <ImageIcon size={24} />
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload size={16} />
                  {uploadingLogo ? 'Enviando...' : 'Carregar Logo'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Nome da Loja *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-0000"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@loja.com.br"
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descricao</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descricao da loja..."
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Endereco</h4>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Rua</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Numero</label>
                <input type="text" name="number" value={formData.number} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Complemento</label>
                <input type="text" name="complement" value={formData.complement} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 0.5 }}>
                <label>UF</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} maxLength={2} />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Entrega</h4>
            <div className="form-row-3">
              <div className="form-group">
                <label>Taxa de Entrega (R$)</label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="form-group">
                <label>Pedido Minimo (R$)</label>
                <input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="form-group">
                <label>Tempo Estimado (min)</label>
                <input
                  type="number"
                  name="estimatedDeliveryTime"
                  value={formData.estimatedDeliveryTime}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Horario de Funcionamento</h4>
            <div className="hours-grid">
              {DAYS_ORDER.map((day) => (
                <div key={day} className="hours-row">
                  <label className="checkbox-label" style={{ width: 140 }}>
                    <input
                      type="checkbox"
                      checked={!openingHours[day].closed}
                      onChange={() => handleDayToggle(day)}
                    />
                    {DAYS_PT[day]}
                  </label>
                  {!openingHours[day].closed && (
                    <div className="hours-inputs">
                      <input
                        type="time"
                        value={openingHours[day].open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      />
                      <span>as</span>
                      <input
                        type="time"
                        value={openingHours[day].close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner-sm" /> : <><Save size={16} /> Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettingsPage
