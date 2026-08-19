import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')

  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await api.put(`/users/${user._id}`, { name, email, phone })
      const updated = { ...user, name, email, phone }
      localStorage.setItem('user', JSON.stringify(updated))
      window.location.reload()
      showToast('Perfil atualizado com sucesso!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg || 'Erro ao atualizar perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (newPassword !== confirmPassword) {
      showToast('As senhas não coincidem', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/users/${user._id}`, {
        password: newPassword,
        currentPassword,
      })
      showToast('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg || 'Erro ao alterar senha', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')) return
    try {
      await api.delete(`/users/${user._id}`)
      showToast('Conta excluída')
      logout()
      navigate('/login')
    } catch {
      showToast('Erro ao excluir conta', 'error')
    }
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <h1 className="page-title">Meu Perfil</h1>

      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name
            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : '??'}
        </div>
        <div className="profile-header-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <span>👤</span> Dados Pessoais
        </button>
        <button
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <span>🔒</span> Alterar Senha
        </button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="profile-form">
          <div className="checkout-section">
            <h2>
              <span className="section-icon">👤</span>
              Dados Pessoais
            </h2>
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleSavePassword} className="profile-form">
          <div className="checkout-section">
            <h2>
              <span className="section-icon">🔒</span>
              Alterar Senha
            </h2>
            <div className="form-group">
              <label htmlFor="currentPassword">Senha atual</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nova senha</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar nova senha</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      )}

      {/* Danger zone */}
      <div className="profile-danger">
        <h3>Zona de perigo</h3>
        <p>Excluir sua conta removerá todos os seus dados permanentemente.</p>
        <button className="btn btn-danger" onClick={handleDeleteAccount}>
          Excluir minha conta
        </button>
      </div>
    </div>
  )
}
