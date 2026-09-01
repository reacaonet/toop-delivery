import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAuthed = Boolean(user)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const isActive = (path: string) => location.pathname === path

  const go = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  const menuItems = isAuthed
    ? [
        { label: 'Perfil', icon: '👤', path: '/profile' },
        { label: 'Endereços', icon: '📍', path: '/addresses' },
        { label: 'Histórico de Pedidos', icon: '📦', path: '/orders' },
        { label: 'Histórico de Corridas', icon: '🚗', path: '/rides' },
      ]
    : [{ label: 'Entrar', icon: '🔑', path: '/login' }]

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
  }

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <h1 className="navbar-logo">GoJá</h1>
          <span className="navbar-logo-sub">Delivery</span>
        </div>
        <div className="navbar-actions">
          {isAuthed ? (
            <button className="btn-logout" onClick={handleLogout}>
              Sair
            </button>
          ) : (
            <button className="btn-login-header" onClick={() => navigate('/login')}>
              Entrar
            </button>
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
          <span className="bottom-nav-icon">🔍</span>
          <span className="bottom-nav-label">Pesquisar</span>
        </button>
        <button
          className={`bottom-nav-item ${isActive('/orders') ? 'active' : ''}`}
          onClick={() => navigate(isAuthed ? '/orders' : '/login')}
        >
          <span className="bottom-nav-icon">📦</span>
          <span className="bottom-nav-label">Pedidos</span>
        </button>
        <button
          className={`bottom-nav-item ${isActive('/rides') || isActive('/rides/new') ? 'active' : ''}`}
          onClick={() => navigate(isAuthed ? '/rides/new' : '/login')}
        >
          <span className="bottom-nav-icon">🚗</span>
          <span className="bottom-nav-label">Corridas</span>
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
          className="bottom-nav-item"
          onClick={() => setMenuOpen(true)}
        >
          <span className="bottom-nav-icon">☰</span>
          <span className="bottom-nav-label">Menu</span>
        </button>
      </nav>

      {/* Menu drawer */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="menu-drawer-header">
              <div className="user-avatar">{isAuthed ? initials : '👤'}</div>
              <div className="menu-drawer-user">
                <strong>{isAuthed ? (user?.name || 'Usuário') : 'Bem-vindo!'}</strong>
                <span>{isAuthed ? (user?.email || '') : 'Entre para ver seus pedidos'}</span>
              </div>
              <button className="menu-drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            {menuItems.map(item => (
              <button
                key={item.path}
                className="menu-drawer-item"
                onClick={() => go(item.path)}
              >
                <span className="menu-drawer-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            {isAuthed && (
              <button className="menu-drawer-item logout" onClick={handleLogout}>
                <span className="menu-drawer-icon">🚪</span>
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
