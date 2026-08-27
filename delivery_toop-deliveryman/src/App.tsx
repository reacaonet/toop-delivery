import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Home, Package, Truck, History, User, Car, Navigation, Wallet, FileText, LogOut, X } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AvailableOrdersPage from './pages/AvailableOrdersPage'
import ActiveDeliveryPage from './pages/ActiveDeliveryPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import AvailableRidesPage from './pages/AvailableRidesPage'
import ActiveRidePage from './pages/ActiveRidePage'
import EarningsPage from './pages/EarningsPage'
import DocumentsPage from './pages/DocumentsPage'

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const go = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  const menuItems = [
    { label: 'Perfil', icon: <User size={18} />, path: '/profile' },
    { label: 'Histórico', icon: <History size={18} />, path: '/history' },
    { label: 'Entregas disponíveis', icon: <Package size={18} />, path: '/available' },
    { label: 'Corrida ativa', icon: <Navigation size={18} />, path: '/active-ride' },
    { label: 'Ganhos', icon: <Wallet size={18} />, path: '/earnings' },
    { label: 'Documentos', icon: <FileText size={18} />, path: '/documents' },
  ]

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => go('/')}
        >
          <Home size={22} />
          Início
        </button>
        <button
          className={`bottom-nav-item ${isActive('/active') ? 'active' : ''}`}
          onClick={() => go('/active')}
        >
          <Truck size={22} />
          Entrega
        </button>
        <button
          className={`bottom-nav-item ${isActive('/available-rides') ? 'active' : ''}`}
          onClick={() => go('/available-rides')}
        >
          <Car size={22} />
          Corridas disp.
        </button>
        <button
          className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => setMenuOpen(true)}
        >
          <User size={22} />
          Menu
        </button>
      </nav>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="menu-drawer-header">
              <div className="menu-drawer-brand">Gojá Entregador</div>
              <button className="menu-drawer-close" onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
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
            <button className="menu-drawer-item logout" onClick={handleLogout}>
              <span className="menu-drawer-icon"><LogOut size={18} /></span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ProtectedLayout() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/available" element={<AvailableOrdersPage />} />
          <Route path="/active" element={<ActiveDeliveryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/available-rides" element={<AvailableRidesPage />} />
          <Route path="/active-ride" element={<ActiveRidePage />} />
          <Route path="/earnings" element={<EarningsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <BottomNav />
    </>
  )
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
