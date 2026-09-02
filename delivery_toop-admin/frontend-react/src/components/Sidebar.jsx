import React, { useState, useEffect } from 'react';
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
  Tag,
  Image,
  FileText,
  Car,
  CalendarCheck,
  Wallet,
  Ticket,
  Package,
  ClipboardList,
  Percent,
  BadgePercent,
  ShoppingBag,
  PackageOpen,
  Store,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deliverymanService } from '../services/api';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [pendingDocsCount, setPendingDocsCount] = useState(0);

  useEffect(() => {
    const fetchPendingDocs = async () => {
      try {
        const data = await deliverymanService.getDeliverymen();
        const list = Array.isArray(data) ? data : (data?.data || []);
        const pending = list.filter((dm) => {
          const docs = dm.documents || {};
          return !(docs.cnh && docs.vehicleDocument && docs.photo);
        });
        setPendingDocsCount(pending.length);
      } catch (error) {
        console.error('Erro ao buscar docs pendentes:', error);
      }
    };
    fetchPendingDocs();
  }, []);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/painel', icon: ClipboardList, label: 'Painel de Pedidos' },
    { path: '/companies', icon: Building2, label: 'Empresas' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/banners', icon: Image, label: 'Banners' },
    { path: '/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/users', icon: Users, label: 'Usuários' },
    { path: '/deliverymen', icon: Truck, label: 'Entregadores' },
    { path: '/drivers', icon: Car, label: 'Motoristas' },
    { path: '/bookings', icon: CalendarCheck, label: 'Corridas' },
    { path: '/promos', icon: Ticket, label: 'Cupons' },
    { path: '/coupons', icon: BadgePercent, label: 'Cupons Compráveis' },
    { path: '/cashback', icon: Percent, label: 'Cashback' },
    { path: '/packings', icon: PackageOpen, label: 'Embalagens' },
    { path: '/shoppers', icon: ShoppingBag, label: 'Shoppers' },
    { path: '/franchises', icon: Store, label: 'Franquias' },
    { path: '/wallet', icon: Wallet, label: 'Wallet Motoristas' },
    { path: '/payments', icon: CreditCard, label: 'Pagamentos' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
    { path: '/reports', icon: FileText, label: 'Relatórios' },
    { path: '/acl', icon: Shield, label: 'Controle de Acesso', adminOnly: true },
  ];

  const isAdmin = !user || user.role === 'admin' || user.role === 'manager';
  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>
          <Truck size={24} />
          Gojá Delivery
        </h1>
      </div>
      
      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <Icon size={20} />
              {item.label}
              {item.path === '/deliverymen' && pendingDocsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '8px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: 1,
                }}>
                  {pendingDocsCount}
                </span>
              )}
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
