import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

interface Address {
  id: string
  label: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

const emptyAddress: Omit<Address, 'id' | 'isDefault'> = {
  label: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadAddresses(): Address[] {
  try {
    return JSON.parse(localStorage.getItem('deliveryAddresses') || '[]')
  } catch {
    return []
  }
}

function saveAddresses(addresses: Address[]) {
  localStorage.setItem('deliveryAddresses', JSON.stringify(addresses))
}

export default function AddressesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyAddress)

  useEffect(() => {
    setAddresses(loadAddresses())
  }, [])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyAddress)
    setShowForm(true)
  }

  const openEdit = (addr: Address) => {
    setEditing(addr)
    setForm({
      label: addr.label,
      street: addr.street,
      number: addr.number,
      complement: addr.complement,
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
    })
    setShowForm(true)
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    if (!form.street || !form.number || !form.neighborhood || !form.city || !form.state) {
      showToast('Preencha os campos obrigatórios', 'error')
      return
    }

    let updated: Address[]

    if (editing) {
      updated = addresses.map((a) =>
        a.id === editing.id ? { ...a, ...form } : a,
      )
      showToast('Endereço atualizado!')
    } else {
      const newAddr: Address = {
        id: generateId(),
        ...form,
        isDefault: addresses.length === 0,
      }
      updated = [...addresses, newAddr]
      showToast('Endereço adicionado!')
    }

    setAddresses(updated)
    saveAddresses(updated)
    setShowForm(false)
    setEditing(null)
    setForm(emptyAddress)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover este endereço?')) return
    const updated = addresses.filter((a) => a.id !== id)
    if (editing?.id === id) {
      setShowForm(false)
      setEditing(null)
    }
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true
    }
    setAddresses(updated)
    saveAddresses(updated)
    showToast('Endereço removido!')
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    setAddresses(updated)
    saveAddresses(updated)
    showToast('Endereço principal definido!')
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="addresses-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Meus Endereços</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          + Novo Endereço
        </button>
      </div>

      {/* Address form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>
                {editing ? 'Editar Endereço' : 'Novo Endereço'}
              </h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="label">Nome do endereço</label>
                  <input
                    id="label"
                    type="text"
                    value={form.label}
                    onChange={(e) => updateField('label', e.target.value)}
                    placeholder="Ex: Casa, Trabalho, academia..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-3">
                    <label htmlFor="street">Rua *</label>
                    <input
                      id="street"
                      type="text"
                      value={form.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="number">Nº *</label>
                    <input
                      id="number"
                      type="text"
                      value={form.number}
                      onChange={(e) => updateField('number', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="complement">Complemento</label>
                  <input
                    id="complement"
                    type="text"
                    value={form.complement}
                    onChange={(e) => updateField('complement', e.target.value)}
                    placeholder="Apto, bloco, torre..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="neighborhood">Bairro *</label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => updateField('neighborhood', e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-2">
                    <label htmlFor="city">Cidade *</label>
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="state">Estado *</label>
                    <input
                      id="state"
                      type="text"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      required
                      maxLength={2}
                      placeholder="UF"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">CEP</label>
                  <input
                    id="zipCode"
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    {editing ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <h2>Nenhum endereço cadastrado</h2>
          <p>Adicione um endereço para fazer pedidos</p>
          <button className="btn btn-primary" onClick={openNew}>
            Adicionar Endereço
          </button>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`address-card ${addr.isDefault ? 'default' : ''}`}
            >
              {addr.isDefault && <span className="address-default-badge">Principal</span>}
              <div className="address-card-content">
                <div className="address-card-label">
                  <span className="address-card-icon">
                    {addr.label?.toLowerCase().includes('trabalho') ? '🏢' :
                     addr.label?.toLowerCase().includes('casa') ? '🏠' : '📍'}
                  </span>
                  <span className="address-card-name">
                    {addr.label || 'Endereço'}
                  </span>
                </div>
                <p className="address-card-line">
                  {addr.street}, {addr.number}
                  {addr.complement && ` - ${addr.complement}`}
                </p>
                <p className="address-card-line">
                  {addr.neighborhood} - {addr.city}/{addr.state}
                </p>
                {addr.zipCode && (
                  <p className="address-card-line">CEP: {addr.zipCode}</p>
                )}
              </div>
              <div className="address-card-actions">
                {!addr.isDefault && (
                  <button
                    className="address-action-btn"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Definir principal
                  </button>
                )}
                <button
                  className="address-action-btn edit"
                  onClick={() => openEdit(addr)}
                >
                  Editar
                </button>
                <button
                  className="address-action-btn delete"
                  onClick={() => handleDelete(addr.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
