import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ExternalLink, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react'
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

const FOOTER_LINKS: { title: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Supermercados', to: '/supermercados' },
      { label: 'Franquias', to: '/franquias' },
      { label: 'Para Lojas', to: '/lojista' },
      { label: 'Para Motoristas', to: '/motorista' },
      { label: 'Fale Conosco', to: '/contato' },
    ],
  },
  {
    title: 'Acesso',
    links: [
      { label: 'Entrar no app', href: LINKS.clientLogin },
      { label: 'Criar conta', href: LINKS.clientRegister },
      { label: 'Painel da Loja', href: LINKS.storeLogin },
      { label: 'Painel do Entregador', href: LINKS.deliverymanLogin },
    ],
  },
  {
    title: 'Políticas',
    links: [
      { label: 'Termos de Uso', to: '/termos' },
      { label: 'Política de Privacidade', to: '/privacidade' },
      { label: 'Política de Cookies', to: '/cookies' },
    ],
  },
]

const FOOTER_CONTACT = [
  { icon: Mail, label: 'contato@godelivery.app.br', href: 'mailto:contato@godelivery.app.br' },
  { icon: Phone, label: '(11) 4000-0000', href: 'tel:+551140000000' },
  { icon: MapPin, label: 'São Paulo - SP' },
]

const FOOTER_SOCIAL = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
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
            <div className="lp-footer-contact">
              {FOOTER_CONTACT.map((c, i) => {
                const Icon = c.icon
                const content = (
                  <>
                    <Icon size={16} />
                    <span>{c.label}</span>
                  </>
                )
                return c.href ? (
                  <a key={i} href={c.href}>{content}</a>
                ) : (
                  <span key={i}>{content}</span>
                )
              })}
            </div>
          </div>
          <div className="lp-footer-links">
            {FOOTER_LINKS.map(col => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map((l, i) =>
                  l.to ? (
                    <Link key={i} to={l.to}>{l.label}</Link>
                  ) : (
                    <a key={i} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <ExternalLink size={12} />
                    </a>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-container lp-footer-bottom">
          <p>© 2026 GoJá Delivery. Todos os direitos reservados.</p>
          <div className="lp-footer-social">
            {FOOTER_SOCIAL.map((s, i) => {
              const Icon = s.icon
              return (
                <a key={i} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <Icon size={18} />
                </a>
              )
            })}
          </div>
        </div>
      </footer>
    </div>
  )
}
