import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <h1 className="navbar-logo">Toop</h1>
          <span className="navbar-logo-sub">Delivery</span>
        </div>
        <div className="navbar-actions">
          <button className="nav-btn" onClick={() => navigate('/orders')}>
            <span className="nav-btn-icon">📦</span>
            Pedidos
          </button>
          <button className="nav-btn" onClick={() => navigate('/addresses')}>
            <span className="nav-btn-icon">📍</span>
            Endereços
          </button>
          {user && (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => navigate('/profile')}
              >
                <div className="user-avatar">{initials}</div>
              </button>
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={logout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">Início</span>
        </button>
        <button
          className={`bottom-nav-item ${isActive('/orders') ? 'active' : ''}`}
          onClick={() => navigate('/orders')}
        >
          <span className="bottom-nav-icon">📦</span>
          <span className="bottom-nav-label">Pedidos</span>
        </button>
        <button
          className={`bottom-nav-item ${isActive('/cart') ? 'active' : ''}`}
          onClick={() => navigate('/cart')}
        >
          <span className="bottom-nav-icon">🛒</span>
          <span className="bottom-nav-label">Carrinho</span>
          {itemCount > 0 && <span className="bottom-nav-badge">{itemCount}</span>}
        </button>
        <button
          className={`bottom-nav-item ${isActive('/profile') || isActive('/addresses') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <span className="bottom-nav-icon">👤</span>
          <span className="bottom-nav-label">Perfil</span>
        </button>
      </nav>
    </div>
  )
}
