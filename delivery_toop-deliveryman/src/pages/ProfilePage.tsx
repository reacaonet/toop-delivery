import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Save, Upload, Star, Truck, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, AlertCircle, MapPin, DollarSign } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  car_basic: { label: 'Carro Básico', icon: '🚗', color: '#6b7280' },
  car_comfort: { label: 'Confort', icon: '🚘', color: '#667eea' },
  car_black: { label: 'Black', icon: '🖤', color: '#111827' },
  moto_basic: { label: 'Moto Básica', icon: '🏍️', color: '#6b7280' },
  taxi: { label: 'Táxi', icon: '🚕', color: '#f59e0b' },
}

const ProfilePage: React.FC = () => {
  const { user, deliverymanId, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cnhInputRef = useRef<HTMLInputElement | null>(null)
  const vehicleDocInputRef = useRef<HTMLInputElement | null>(null)
  const photoDocInputRef = useRef<HTMLInputElement | null>(null)

  const dm = user?.deliveryman

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
    vehicleType: 'motorcycle',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    avatar: '',
  })

  const [documents, setDocuments] = useState({
    cnh: '',
    vehicleDocument: '',
    photo: '',
  })

  const [address, setAddress] = useState('')
  const [addressLat, setAddressLat] = useState<number | null>(null)
  const [addressLng, setAddressLng] = useState<number | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const addressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressRef = useRef<HTMLDivElement>(null)

  const [brandOptions, setBrandOptions] = useState<string[]>([])
  const [modelOptions, setModelOptions] = useState<string[]>([])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data: brandData } = await api.get('/vehicle-category/options')
        if (Array.isArray(brandData?.brands)) setBrandOptions(brandData.brands)
      } catch { /* opcional */ }
    }
    loadOptions()
  }, [])

  useEffect(() => {
    const brand = (formData.vehicleBrand || '').trim()
    if (!brand) { setModelOptions([]); return }
    let t: ReturnType<typeof setTimeout> | undefined
    t = setTimeout(async () => {
      try {
        const { data: modelData } = await api.get('/vehicle-category/options', { params: { brand } })
        if (Array.isArray(modelData?.models)) setModelOptions(modelData.models)
      } catch { /* opcional */ }
    }, 300)
    return () => { if (t) clearTimeout(t) }
  }, [formData.vehicleBrand])

  useEffect(() => {
    if (deliverymanId) {
      loadProfile()
    } else if (dm) {
      setFormData({
        name: dm.name || '',
        email: dm.email || '',
        phone: dm.phone || '',
        cpf: dm.cpf || '',
        cnh: dm.cnh || '',
        vehicleType: dm.vehicleType || 'motorcycle',
        vehicleBrand: dm.vehicleBrand || '',
        vehicleModel: dm.vehicleModel || '',
        vehicleYear: dm.vehicleYear ? String(dm.vehicleYear) : '',
        vehiclePlate: dm.vehiclePlate || '',
        avatar: dm.avatar || '',
      })
      setDocuments({
        cnh: dm.documents?.cnh || '',
        vehicleDocument: dm.documents?.vehicleDocument || '',
        photo: dm.documents?.photo || '',
      })
      setAddress(dm.address || '')
      setAddressLat(dm.addressLat || null)
      setAddressLng(dm.addressLng || null)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [dm, deliverymanId])

  const loadProfile = async () => {
    try {
      const res = await api.get(`/deliverymen/${deliverymanId}`)
      const data = res.data?.data ?? res.data
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
        cnh: data.cnh || '',
        vehicleType: data.vehicleType || 'motorcycle',
        vehicleBrand: data.vehicleBrand || '',
        vehicleModel: data.vehicleModel || '',
        vehicleYear: data.vehicleYear ? String(data.vehicleYear) : '',
        vehiclePlate: data.vehiclePlate || '',
        avatar: data.avatar || '',
      })
      setDocuments({
        cnh: data.documents?.cnh || '',
        vehicleDocument: data.documents?.vehicleDocument || '',
        photo: data.documents?.photo || '',
      })
      setAddress(data.address || '')
      setAddressLat(data.addressLat || null)
      setAddressLng(data.addressLng || null)
    } catch (e) {
      console.error('Erro ao carregar perfil:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const [liveCategory, setLiveCategory] = useState('')

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const vt = formData.vehicleType
    if (vt === 'taxi') { setLiveCategory('taxi'); return }
    const brand = (formData.vehicleBrand || '').trim()
    const model = (formData.vehicleModel || '').trim()
    if (vt !== 'car' || (!brand && !model)) { setLiveCategory(''); return }
    t = setTimeout(async () => {
      try {
        const { data } = await api.get('/vehicle-category/classify', {
          params: {
            vehicleType: vt,
            vehicleBrand: brand,
            vehicleModel: model,
            vehicleYear: formData.vehicleYear || undefined,
          },
        })
        const code = data?.code ?? data?.data?.code
        if (code) setLiveCategory(code)
      } catch { /* mantem ultimo valor disponivel */ }
    }, 350)
    return () => { if (t) clearTimeout(t) }
  }, [formData.vehicleType, formData.vehicleBrand, formData.vehicleModel, formData.vehicleYear])

  const shownCategory = liveCategory || dm?.rideCategoryCode || ''
  const shownMeta = CATEGORY_META[shownCategory]

  const searchAddress = async (query: string) => {
    if (query.length < 3) { setAddressSuggestions([]); return }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`, {
        headers: { 'Accept-Language': 'pt-BR' }
      })
      setAddressSuggestions(await res.json())
    } catch {}
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    setShowSuggestions(true)
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current)
    addressTimeoutRef.current = setTimeout(() => searchAddress(value), 400)
  }

  const selectAddress = (s: any) => {
    const shortAddr = s.display_name.split(',').slice(0, 3).join(',')
    setAddress(shortAddr)
    setAddressLat(parseFloat(s.lat))
    setAddressLng(parseFloat(s.lon))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('avatar')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (url) {
        setFormData((prev) => ({ ...prev, avatar: url }))
      }
    } catch (err: any) {
      alert('Erro ao enviar foto: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploadingField(null)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docField: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField(docField)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (url) {
        setDocuments((prev) => ({ ...prev, [docField]: url }))
      }
    } catch (err: any) {
      alert('Erro ao enviar documento: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliverymanId) {
      alert('Erro: ID do entregador nao encontrado. Faca logout e login novamente.')
      return
    }
    setSaving(true)
    try {
      await api.put('/deliverymen/me', {
        name: formData.name,
        phone: formData.phone,
        cpf: formData.cpf,
        cnh: formData.cnh,
        vehicleType: formData.vehicleType,
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear ? Number(formData.vehicleYear) : undefined,
        vehiclePlate: formData.vehiclePlate,
        avatar: formData.avatar,
        documents,
        address,
        addressLat,
        addressLng,
      })
      refreshUser()
      alert('Perfil atualizado com sucesso!')
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

  if (!deliverymanId) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <User size={48} />
          <p>Perfil nao encontrado. Faca logout e login novamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-container">
          {formData.avatar ? (
            <img src={formData.avatar} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <User size={40} />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef as React.RefObject<HTMLInputElement>}
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="avatar-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingField === 'avatar'}
          >
            <Upload size={14} />
          </button>
        </div>
        <div className="profile-header-info">
          <h2>{formData.name || 'Entregador'}</h2>
          <p>{formData.email}</p>
          <div className="profile-stats">
            <div className="profile-stat">
              <Star size={16} className="star-icon" />
              <span>{dm?.rating ?? '-'}</span>
            </div>
            <div className="profile-stat">
              <Truck size={16} />
              <span>{dm?.totalDeliveries ?? 0} entregas</span>
            </div>
            {dm?.isDriver && (
              <div className="profile-stat">
                <span style={{ fontSize: '0.85rem' }}>🚗</span>
                <span>{dm?.totalTrips ?? 0} corridas</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="section-title">Dados Pessoais</h3>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                value={formData.email}
                disabled
                className="input-disabled"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <div className="input-with-icon">
              <Phone size={16} />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-0000"
              />
            </div>
          </div>
          <div className="form-group">
            <label>CPF</label>
            <div className="input-with-icon">
              <FileText size={16} />
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <div className="input-with-icon" ref={addressRef} style={{ position: 'relative' }}>
              <MapPin size={16} />
              <input
                type="text"
                value={address}
                onChange={e => handleAddressChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Digite seu endereço..."
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="address-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflow: 'auto' }}>
                  {addressSuggestions.map((s: any, i: number) => (
                    <button key={i} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', borderBottom: '1px solid #f3f4f6' }} onClick={() => selectAddress(s)}>
                      <MapPin size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                      <span>{s.display_name.split(',').slice(0, 3).join(',')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Veiculo</h3>
          <div className="form-group">
            <label>Tipo de Veiculo</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
              <option value="bike">Bicicleta</option>
              <option value="motorcycle">Moto</option>
              <option value="car">Carro</option>
              <option value="van">Van</option>
              <option value="taxi">Táxi</option>
            </select>
          </div>
          {formData.vehicleType === 'car' && (
            <>
              <div className="form-group">
                <label>Marca do Veículo</label>
                <input
                  type="text"
                  name="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={handleChange}
                  placeholder="ex: Nissan"
                  list="vehicle-brand-options"
                />
                <datalist id="vehicle-brand-options">
                  {brandOptions.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="ex: Versa 1.6"
                  list="vehicle-model-options"
                />
                <datalist id="vehicle-model-options">
                  {modelOptions.map((m) => <option key={m} value={m} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Ano do Veículo</label>
                <input
                  type="number"
                  name="vehicleYear"
                  min={1990}
                  max={2100}
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  placeholder="ex: 2022"
                />
              </div>
            </>
          )}
          {(liveCategory || dm?.rideCategoryCode) ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px',
              background: '#f3f4f6', border: '1px solid #e5e7eb', marginBottom: '12px',
            }}>
              <span style={{ fontSize: '1.4rem' }}>{shownMeta?.icon || '🚗'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.04em' }}>Categoria do veículo</div>
                <div style={{ fontWeight: 700, color: shownMeta?.color || '#111827' }}>
                  {shownMeta?.label || 'Carro Básico'}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', maxWidth: '140px', textAlign: 'right' }}>
                calculada pelo modelo e ano
              </span>
            </div>
          ) : null}
          <div className="form-group">
            <label>Placa</label>
            <input
              type="text"
              name="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={handleChange}
              placeholder="ABC-1234"
            />
          </div>
          <div className="form-group">
            <label>CNH (Numero)</label>
            <input
              type="text"
              name="cnh"
              value={formData.cnh}
              onChange={handleChange}
              placeholder="Numero da CNH"
            />
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Documentos</h3>
          <p className="section-desc">Envie seus documentos para validacao pelo administrador.</p>

          <input
            type="file"
            accept="image/*,.pdf"
            ref={cnhInputRef as React.RefObject<HTMLInputElement>}
            onChange={(e) => handleDocumentUpload(e, 'cnh')}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*,.pdf"
            ref={vehicleDocInputRef as React.RefObject<HTMLInputElement>}
            onChange={(e) => handleDocumentUpload(e, 'vehicleDocument')}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={photoDocInputRef as React.RefObject<HTMLInputElement>}
            onChange={(e) => handleDocumentUpload(e, 'photo')}
            style={{ display: 'none' }}
          />

          <div className="doc-list">
            <div className="doc-item">
              <div className="doc-info">
                <FileText size={20} />
                <div>
                  <span className="doc-name">CNH</span>
                  <span className="doc-hint">Foto ou PDF da CNH</span>
                </div>
              </div>
              <div className="doc-actions">
                {documents.cnh ? (
                  <a href={documents.cnh} target="_blank" rel="noopener noreferrer" className="doc-preview-link">
                    <CheckCircle size={16} className="doc-ok" />
                    Enviado
                  </a>
                ) : (
                  <span className="doc-pending">
                    <AlertCircle size={16} />
                    Pendente
                  </span>
                )}
                <button
                  type="button"
                  className="doc-upload-btn"
                  onClick={() => cnhInputRef.current?.click()}
                  disabled={uploadingField === 'cnh'}
                >
                  <Upload size={14} />
                  {uploadingField === 'cnh' ? 'Enviando...' : documents.cnh ? 'Trocar' : 'Enviar'}
                </button>
              </div>
            </div>

            <div className="doc-item">
              <div className="doc-info">
                <FileText size={20} />
                <div>
                  <span className="doc-name">Documento do Veiculo</span>
                  <span className="doc-hint">CRLV ou documento do veiculo</span>
                </div>
              </div>
              <div className="doc-actions">
                {documents.vehicleDocument ? (
                  <a href={documents.vehicleDocument} target="_blank" rel="noopener noreferrer" className="doc-preview-link">
                    <CheckCircle size={16} className="doc-ok" />
                    Enviado
                  </a>
                ) : (
                  <span className="doc-pending">
                    <AlertCircle size={16} />
                    Pendente
                  </span>
                )}
                <button
                  type="button"
                  className="doc-upload-btn"
                  onClick={() => vehicleDocInputRef.current?.click()}
                  disabled={uploadingField === 'vehicleDocument'}
                >
                  <Upload size={14} />
                  {uploadingField === 'vehicleDocument' ? 'Enviando...' : documents.vehicleDocument ? 'Trocar' : 'Enviar'}
                </button>
              </div>
            </div>

            <div className="doc-item">
              <div className="doc-info">
                <ImageIcon size={20} />
                <div>
                  <span className="doc-name">Foto do Entregador</span>
                  <span className="doc-hint">Selfie ou foto de rosto</span>
                </div>
              </div>
              <div className="doc-actions">
                {documents.photo ? (
                  <a href={documents.photo} target="_blank" rel="noopener noreferrer" className="doc-preview-link">
                    <CheckCircle size={16} className="doc-ok" />
                    Enviado
                  </a>
                ) : (
                  <span className="doc-pending">
                    <AlertCircle size={16} />
                    Pendente
                  </span>
                )}
                <button
                  type="button"
                  className="doc-upload-btn"
                  onClick={() => photoDocInputRef.current?.click()}
                  disabled={uploadingField === 'photo'}
                >
                  <Upload size={14} />
                  {uploadingField === 'photo' ? 'Enviando...' : documents.photo ? 'Trocar' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? <div className="spinner-sm" /> : <><Save size={16} /> Salvar Alteracoes</>}
        </button>

        <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('/earnings')} style={{ marginTop: 12 }}>
          <DollarSign size={16} /> Ver Ganhos
        </button>

        <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('/documents')} style={{ marginTop: 12 }}>
          <FileText size={16} /> Documentos
        </button>
      </form>
    </div>
  )
}

export default ProfilePage
