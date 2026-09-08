import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ExternalLink } from 'lucide-react'
import { LINKS } from '../constants'

export interface FrameProps {
  active: 'home' | 'store' | 'driver' | 'contact' | 'franchise' | 'supermarket'
  children: ReactNode
}

const NAV = [
  { to: '/', label: 'Início' },
  { to: '/supermercados', label: 'Supermercados' },
  { to: '/franquias', label: 'Franquias' },
  { to: '/lojista', label: 'Para Lojas' },
  { to: '/motorista', label: 'Para Motoristas' },
  { to: '/contato', label: 'Fale Conosco' },
]

const FOOTER_LINKS = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Início', to: '/' },
      { label: 'Supermercados', to: '/supermercados' },
      { label: 'Franquias', to: '/franquias' },
      { label: 'Para Lojas', to: '/lojista' },
      { label: 'Para Motoristas', to: '/motorista' },
      { label: 'Fale Conosco', to: '/contato' },
    ],
  },
]

const NAV_CTA = [
  { label: 'Entrar', href: LINKS.clientLogin, variant: 'outline' },
  { label: 'Cadastrar', href: LINKS.clientRegister },
]

export default function SiteFrame({ active, children }: FrameProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <Link to="/" className="lp-logo" onClick={closeMenu}>
            <span className="lp-logo-icon">🛵</span>
            <span className="lp-logo-text">GoJá <span>Delivery</span></span>
          </Link>
          <div className={`lp-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                onClick={closeMenu}
                className={pathname === n.to ? 'lp-nav-active' : ''}
              >
                {n.label}
              </Link>
            ))}
            <span className="lp-nav-ctas">
              {NAV_CTA.map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className={`lp-btn lp-btn-sm ${c.variant === 'outline' ? 'lp-btn-outline' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.label} <ExternalLink size={14} />
                </a>
              ))}
            </span>
          </div>
          <button className="lp-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-logo">
              <span className="lp-logo-icon">🛵</span>
              <span className="lp-logo-text">GoJá <span>Delivery</span></span>
            </span>
            <p>A plataforma completa de delivery para o Brasil.</p>
          </div>
          <div className="lp-footer-links">
            {FOOTER_LINKS.map(col => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map(l => (
                  <Link key={l.to} to={l.to}>{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-container lp-footer-bottom">
          <p>© 2026 GoJá Delivery. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
