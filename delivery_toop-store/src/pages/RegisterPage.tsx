import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { Store, Mail, Lock, Phone, Building2, Tag } from 'lucide-react'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    category: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register-store', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        cnpj: form.cnpj || undefined,
        category: form.category || undefined,
        password: form.password,
      })
      navigate('/login', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Store size={32} />
          </div>
          <h1>GoJá Delivery</h1>
          <p>Cadastro da Loja</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Loja *</label>
            <div className="input-icon-wrapper">
              <Building2 size={18} className="input-icon" />
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ex: Pizzaria da Vila"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <div className="input-icon-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label>CNPJ</label>
            <div className="input-icon-wrapper">
              <Building2 size={18} className="input-icon" />
              <input
                name="cnpj"
                type="text"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <div className="input-icon-wrapper">
              <Tag size={18} className="input-icon" />
              <input
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="Ex: Hamburgueria, Pizzaria, Restaurante"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha *</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Senha *</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Repita a senha"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <div className="spinner-sm" /> : 'Cadastrar Loja'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
