import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Store, Monitor, FileText, Warehouse, GitBranch, Boxes, ArrowLeftRight, Tags, Pizza } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/painel', icon: Monitor, label: 'Painel de Pedidos' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/addons', icon: Pizza, label: 'Acompanhamentos' },
    { path: '/categories', icon: Tags, label: 'Categorias' },
    { path: '/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/stock', icon: Warehouse, label: 'Estoque' },
    { path: '/stock/items', icon: Boxes, label: 'Itens de Estoque' },
    { path: '/stock/batches', icon: GitBranch, label: 'Lotes' },
    { path: '/stock/movements', icon: ArrowLeftRight, label: 'Movimentacoes' },
    { path: '/stock/branches', icon: Store, label: 'Filiais' },
    { path: '/reports', icon: FileText, label: 'Relatorios' },
    { path: '/settings', icon: Settings, label: 'Configuracoes', divider: true },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Store size={24} />
            <span>GoJá Loja</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Fragment key={item.path}>
                {item.divider && <div className="nav-divider" />}
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </Fragment>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
