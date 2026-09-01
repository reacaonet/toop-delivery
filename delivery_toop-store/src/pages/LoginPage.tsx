import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Store, Mail, Lock, LogIn, ShoppingBag, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Credenciais invalidas')
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
          <h2>Gerencie sua loja <br />em um só lugar</h2>
          <p>
            Acompanhe pedidos em tempo real, controle seu cardápio,
            estoque e receba pagamentos com toda a praticidade que
            o seu negócio merece.
          </p>
        </div>

        <div className="auth-panel-footer">
          <span />
          Painel da Loja - Gestão completa para o seu delivery
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-mobile-logo">
              <Store size={24} />
            </div>
            <h1>Bem-vindo de volta</h1>
            <p>
              Acesse o <span className="auth-gojalink">GoJá Delivery</span> para
              gerenciar sua loja
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                />
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
                  Entrar <LogIn size={18} />
                </span>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Ainda não tem conta?
            <Link to="/register">Cadastrar loja</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
