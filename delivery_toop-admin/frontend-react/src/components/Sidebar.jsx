import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Truck, 
  Settings,
  User,
  LogOut,
  Car,
  Landmark,
  Megaphone,
  UserRound,
  ChevronDown,
  LayoutGrid
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

  const groups = [
    {
      label: 'Negócios',
      icon: Building2,
      children: [
        { path: '/companies', label: 'Empresas / Lojas' },
        { path: '/franchises', label: 'Franquias' },
        { path: '/groups', label: 'Grupos de Empresas' },
      ],
    },
    {
      label: 'Catálogo',
      icon: LayoutGrid,
      children: [
        { path: '/app-categories', label: 'Categorias do App' },
      ],
    },
    {
      label: 'Mobilidade',
      icon: Car,
      children: [
        { type: 'header', label: 'Cadastros' },
        { path: '/mobility/services', label: 'Serviços' },
        { path: '/mobility/document-types', label: 'Tipos de Documento' },
        { path: '/mobility/documents', label: 'Documentos' },
        { path: '/mobility/peak-hours', label: 'Pico Horário' },
        { path: '/mobility/support-subjects', label: 'Assuntos de Suporte' },
        { type: 'header', label: 'Operação' },
        { path: '/bookings', label: 'Corridas' },
        { path: '/mobility/monitoring', label: 'Monitor em Tempo Real' },
        { path: '/mobility/extract', label: 'Extrato do Motorista' },
        { path: '/mobility/evaluations', label: 'Avaliações' },
        { path: '/mobility/qr-codes', label: 'QR Codes' },
        { type: 'header', label: 'Relatórios' },
        { path: '/mobility/reports', label: 'Relatórios Mobility' },
      ],
    },
    {
      label: 'Financeiro',
      icon: Landmark,
      children: [
        { path: '/wallet', label: 'Wallet Motoristas' },
        { path: '/wallet/withdrawals', label: 'Solicitações de Saque' },
        { path: '/payments', label: 'Pagamentos' },
        { path: '/reports', label: 'Relatórios' },
      ],
    },
    {
      label: 'Marketing',
      icon: Megaphone,
      children: [
        { path: '/banners', label: 'Banners / Promoções' },
        { path: '/promos', label: 'Cupons' },
      ],
    },
    {
      label: 'Sistema',
      icon: Settings,
      children: [
        { path: '/settings', label: 'Configurações' },
        { path: '/helpdesk', label: 'HelpDesk / FAQ' },
        { path: '/reviews', label: 'Avaliações de Lojas / Entregadores' },
        { path: '/access-flow', label: 'Access Flow' },
        { path: '/log', label: 'Log / Auditoria' },
        { path: '/monitor', label: 'Monitor / Tools' },
        { path: '/acl', label: 'Controle de Acesso', adminOnly: true },
      ],
    },
  ];

  const isAdmin = !user || user.role === 'admin' || user.role === 'manager';
  const isActivePath = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const [openGroups, setOpenGroups] = useState(() => {
    const active = groups
      .filter(g => g.children.some(c => c.path && isActivePath(c.path)))
      .map(g => g.label);
    return new Set(active);
  });

  const toggleGroup = (label) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderBadge = () => (
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
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>
          <Truck size={24} />
          Gojá Delivery
        </h1>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          style={{ position: 'relative' }}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          to="/deliverymen"
          className={`nav-item ${location.pathname === '/deliverymen' ? 'active' : ''}`}
          style={{ position: 'relative' }}
        >
          <Truck size={20} />
          Motoristas & Entregadores
          {pendingDocsCount > 0 && renderBadge()}
        </Link>

        <Link
          to="/users"
          className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}
          style={{ position: 'relative' }}
        >
          <UserRound size={20} />
          Usuários / Clientes
        </Link>

        {groups.map(group => {
          const GroupIcon = group.icon;
          const isOpen = openGroups.has(group.label);
          const activeGroup = group.children.some(c => c.path && isActivePath(c.path));
          const children = group.children.filter(c => !c.adminOnly || isAdmin);

          return (
            <div key={group.label}>
              <button
                type="button"
                className={`nav-section ${isOpen ? 'open' : ''} ${activeGroup ? 'active' : ''}`}
                onClick={() => toggleGroup(group.label)}
              >
                <span className="nav-section-title">
                  <GroupIcon size={20} />
                  {group.label}
                </span>
                <ChevronDown size={16} className="nav-section-chevron" />
              </button>

              {isOpen && (
                <div className="nav-submenu">
                  {children.map(child => {
                    if (child.type === 'header') {
                      return (
                        <div key={child.label} className="nav-subheader">
                          {child.label}
                        </div>
                      );
                    }
                    const isSubActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`nav-subitem ${isSubActive ? 'active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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