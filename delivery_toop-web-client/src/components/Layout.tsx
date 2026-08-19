import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <h1 className="navbar-logo">Toop</h1>
          <span className="navbar-logo-sub">Delivery</span>
        </div>
        <div className="navbar-actions">
          <button className="nav-btn" onClick={() => navigate('/orders')}>
            📦 Pedidos
          </button>
          {user && (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
