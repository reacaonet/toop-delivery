import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { Store, Mail, Lock, Phone, Building2, Tag, ArrowRight, UserRound } from 'lucide-react'

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
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Store size={24} />
          </div>
          <span className="auth-brand-name">GoJá Delivery</span>
        </div>

        <div className="auth-panel-content">
          <h2>Leve sua loja<br />para o delivery</h2>
          <p>
            Cadastre-se em poucos minutos e comece a receber pedidos
            pela internet. Sem mensalidades para começar - pague apenas
            quando vender.
          </p>
        </div>

        <div className="auth-panel-footer">
          <span />
          Comece a vender online hoje
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-mobile-logo">
              <Store size={24} />
            </div>
            <h1>Criar conta</h1>
            <p>
              Cadastre a sua loja no <span className="auth-gojalink">GoJá Delivery</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field-row">
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
                    placeholder="Ex: Pizzaria"
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
                    placeholder="Hamburgueria"
                  />
                </div>
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

            <div className="auth-field-row">
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
                  <UserRound size={18} className="input-icon" />
                  <input
                    name="cnpj"
                    type="text"
                    value={form.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
            </div>

            <div className="auth-field-row">
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
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-sm" />
              ) : (
                <span className="submit-with-icon">
                  Cadastrar Loja <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Já tem conta?
            <Link to="/login">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
