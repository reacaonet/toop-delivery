import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Settings,
  User,
  LogOut,
  Monitor,
  Tag,
  Package,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/companies', icon: Building2, label: 'Empresas' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/banners', icon: Image, label: 'Banners' },
    { path: '/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/users', icon: Users, label: 'Usuários' },
    { path: '/deliverymen', icon: Truck, label: 'Entregadores' },
    { path: '/payments', icon: CreditCard, label: 'Pagamentos' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
    { path: '/painel', icon: Monitor, label: 'Painel de Pedidos' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>
          <Truck size={24} />
          Toop Delivery
        </h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
        
        <Link
          to="/profile"
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}
        >
          <User size={20} />
          Meu Perfil
        </Link>
        
        <button 
          className="nav-item" 
          onClick={logout}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          Sair
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
