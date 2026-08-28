import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }
    try {
      await register({ name, email, phone: phone || undefined, password })
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao criar conta'
      setError(msg)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-content">
          <h1>GoJá</h1>
          <p className="tagline">Delivery</p>
          <div className="login-hero-features">
            <div className="login-feature">
              <div className="login-feature-icon">🍽️</div>
              <span>Dezertas de restaurants perto de você</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">⚡</div>
              <span>Entrega rápida e rastreável</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">💳</div>
              <span>Pague como preferir: PIX, cartão ou dinheiro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-logo">
            <h1>GoJá</h1>
            <span>Delivery</span>
          </div>
          <h2>Criar conta</h2>
          <p className="subtitle">Cadastre-se para começar a pedir</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <div className="form-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="form-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <div className="form-input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  id="phone"
                  className="form-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="form-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <div className="form-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
