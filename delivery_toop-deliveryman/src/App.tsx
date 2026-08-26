import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Home, Package, Truck, History, User, Car, Navigation } from 'lucide-react'
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
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => window.location.href = '/'}
      >
        <Home size={22} />
        Início
      </button>
      <button
        className={`bottom-nav-item ${isActive('/available') ? 'active' : ''}`}
        onClick={() => window.location.href = '/available'}
      >
        <Package size={22} />
        Disponíveis
      </button>
      <button
        className={`bottom-nav-item ${isActive('/active') ? 'active' : ''}`}
        onClick={() => window.location.href = '/active'}
      >
        <Truck size={22} />
        Entrega
      </button>
      <button
        className={`bottom-nav-item ${isActive('/available-rides') ? 'active' : ''}`}
        onClick={() => window.location.href = '/available-rides'}
      >
        <Car size={22} />
        Corridas
      </button>
      <button
        className={`bottom-nav-item ${isActive('/active-ride') ? 'active' : ''}`}
        onClick={() => window.location.href = '/active-ride'}
      >
        <Navigation size={22} />
        Ativa
      </button>
      <button
        className={`bottom-nav-item ${isActive('/history') ? 'active' : ''}`}
        onClick={() => window.location.href = '/history'}
      >
        <History size={22} />
        Historico
      </button>
      <button
        className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => window.location.href = '/profile'}
      >
        <User size={22} />
        Perfil
      </button>
    </nav>
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
