import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <div className="topbar">
        <div className="topbar-brand">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-1 4-4-4-4 1-1 5 5-5 5z" />
          </svg>
          Gojá Entregador
        </div>
        <div className="topbar-right">
          <span className="topbar-user">{user?.email}</span>
          <button className="topbar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
      <div className="layout-content">
        {children}
      </div>
    </div>
  )
}

export default Layout
