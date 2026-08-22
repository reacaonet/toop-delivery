import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return 'Dashboard';
      case '/users': return 'Usuários';
      case '/companies': return 'Empresas';
      case '/orders': return 'Pedidos';
      case '/deliverymen': return 'Entregadores';
      case '/payments': return 'Pagamentos';
      case '/settings': return 'Configurações';
      case '/reports': return 'Relatórios';
      default: return 'Dashboard';
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="header">
      <h2>{getPageTitle()}</h2>
      
      <div style={{ position: 'relative' }} ref={menuRef}>
        <div 
          className="user-info"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ marginRight: '0.5rem' }}>{user?.name}</span>
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <ChevronDown size={16} style={{ marginLeft: '0.5rem' }} />
        </div>

        {showProfileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.5rem 0' }}>
              <button
                onClick={handleProfile}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <User size={16} />
                Meu Perfil
              </button>
              
              <button
                onClick={handleSettings}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Settings size={16} />
                Configurações
              </button>
              
              <div style={{ 
                height: '1px', 
                background: '#e5e7eb', 
                margin: '0.5rem 0' 
              }} />
              
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
