import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Email ou senha inválidos'
      setError(msg)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-content">
          <h1>Toop</h1>
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
            <h1>Toop</h1>
            <span>Delivery</span>
          </div>
          <h2>Entrar</h2>
          <p className="subtitle">Acesse sua conta para fazer pedidos</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

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
              <label htmlFor="password">Senha</label>
              <div className="form-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
