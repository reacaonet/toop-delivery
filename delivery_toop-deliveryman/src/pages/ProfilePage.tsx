import { useState, useEffect, useRef } from 'react'
import { User, Save, Upload, Star, Truck, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, AlertCircle, MapPin } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

const ProfilePage: React.FC = () => {
  const { user, deliverymanId, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cnhInputRef = useRef<HTMLInputElement>(null)
  const vehicleDocInputRef = useRef<HTMLInputElement>(null)
  const photoDocInputRef = useRef<HTMLInputElement>(null)

  const dm = user?.deliveryman

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
    vehicleType: 'motorcycle',
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

  useEffect(() => {
    if (dm) {
      setFormData({
        name: dm.name || '',
        email: dm.email || '',
        phone: dm.phone || '',
        cpf: dm.cpf || '',
        cnh: dm.cnh || '',
        vehicleType: dm.vehicleType || 'motorcycle',
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
    } else if (deliverymanId) {
      loadProfile()
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
            ref={fileInputRef}
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
            </select>
          </div>
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
            ref={cnhInputRef}
            onChange={(e) => handleDocumentUpload(e, 'cnh')}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*,.pdf"
            ref={vehicleDocInputRef}
            onChange={(e) => handleDocumentUpload(e, 'vehicleDocument')}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={photoDocInputRef}
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
      </form>
    </div>
  )
}

export default ProfilePage
