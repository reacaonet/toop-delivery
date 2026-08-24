import { useState } from 'react'
import {
  Store, Truck, ShoppingBag, ArrowRight, CheckCircle, Clock, Star,
  MapPin, BarChart3, Bell, Shield, Zap, Users, TrendingUp, ChevronRight,
  Menu, X, Phone, Mail, ExternalLink
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Para Lojas', href: '#lojas' },
  { label: 'Para Entregadores', href: '#entregadores' },
  { label: 'Para Clientes', href: '#clientes' },
  { label: 'Como Funciona', href: '#como-funciona' },
]

const FEATURES_STORE = [
  { icon: <ShoppingBag size={24} />, title: 'Painel de Pedidos', desc: 'Gerencie todos os pedidos em tempo real com painel Kanban visual e intuitivo.' },
  { icon: <Store size={24} />, title: 'Cardápio Digital', desc: 'Cadastre categorias, produtos com fotos, preços e disponibilidade.' },
  { icon: <BarChart3 size={24} />, title: 'Relatórios Financeiros', desc: 'Acompanhe faturamento, comissões, pedidos por período e ranking de produtos.' },
  { icon: <Clock size={24} />, title: 'Horário de Funcionamento', desc: 'Configure horários por dia da semana. Loja automaticamente mostra aberto/fechado.' },
  { icon: <Bell size={24} />, title: 'Notificações', desc: 'Receba alertas instantâneos quando novos pedidos chegarem.' },
  { icon: <TrendingUp size={24} />, title: 'Comissão Dinâmica', desc: 'Configuração transparente de taxas de entrega e comissão da plataforma.' },
]

const FEATURES_DELIVERYMAN = [
  { icon: <Zap size={24} />, title: 'Pedidos Disponíveis', desc: 'Veja pedidos prontos e escolha qual aceitar. Liberdade total.' },
  { icon: <MapPin size={24} />, title: 'Rota no Google Maps', desc: 'Abra a rota de entrega direto no Maps com um toque.' },
  { icon: <TrendingUp size={24} />, title: 'Ganhos do Dia', desc: 'Acompanhe seus ganhos em tempo real, pedido por pedido.' },
  { icon: <Star size={24} />, title: 'Avaliações', desc: 'Construa sua reputação com avaliações de clientes.' },
]

const FEATURES_CLIENT = [
  { icon: <Store size={24} />, title: 'Busca Inteligente', desc: 'Encontre lojas e produtos por nome, categoria ou favoritos.' },
  { icon: <Clock size={24} />, title: 'Estimativa de Entrega', desc: 'Veja o tempo estimado antes de fazer seu pedido.' },
  { icon: <MapPin size={24} />, title: 'Múltiplos Endereços', desc: 'Salve casa, trabalho e mais endereços para usar no checkout.' },
  { icon: <Star size={24} />, title: 'Avaliar Loja e Entregador', desc: 'Deixe sua avaliação após cada entrega para ajudar a comunidade.' },
]

const HOW_STEPS = [
  { num: '01', title: 'Cadastre sua Loja', desc: 'Crie sua conta gratuitamente em poucos minutos. Preencha dados básicos e comece.', icon: <Store size={32} /> },
  { num: '02', title: 'Configure seu Cardápio', desc: 'Adicione categorias, produtos com fotos, preços e tempos de preparo.', icon: <ShoppingBag size={32} /> },
  { num: '03', title: 'Receba Pedidos', desc: 'Pedidos chegam em tempo real. Acompanhe do início ao fim com o painel.', icon: <CheckCircle size={32} /> },
]

const STATS = [
  { value: '100%', label: 'Gratuito para começar' },
  { value: '24/7', label: 'Suporte disponível' },
  { value: '<5min', label: 'Tempo de cadastro' },
  { value: '∞', label: 'Pedidos sem limite' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="lp">
      {/* NAVBAR */}
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#" className="lp-logo">
            <span className="lp-logo-icon">🛵</span>
            <span className="lp-logo-text">Toop<span>Delivery</span></span>
          </a>
          <div className={`lp-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
            ))}
            <a href="/login" className="lp-btn lp-btn-sm lp-btn-outline">Entrar</a>
            <a href="/register" className="lp-btn lp-btn-sm">Cadastrar</a>
          </div>
          <button className="lp-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">🚀 Plataforma de Delivery #1</div>
            <h1>
              Gerencie seu delivery<br />
              <span className="lp-hero-highlight">de forma simples e inteligente</span>
            </h1>
            <p className="lp-hero-sub">
              Uma plataforma completa para lojas, entregadores e clientes.
              Pedidos em tempo real, relatórios financeiros, rastreio de entrega e muito mais.
            </p>
            <div className="lp-hero-ctas">
              <a href="/register" className="lp-btn lp-btn-lg">
                Comece Agora <ArrowRight size={18} />
              </a>
              <a href="#como-funciona" className="lp-btn lp-btn-lg lp-btn-ghost">
                Como Funciona
              </a>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Sem cartão de crédito</span>
              <span>✅ Cancellation anytime</span>
              <span>✅ Setup em 5 minutos</span>
            </div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-hero-phone">
              <div className="lp-phone-screen">
                <div className="lp-phone-header">
                  <div className="lp-phone-statusbar">
                    <span>9:41</span>
                    <span>🔋 📶</span>
                  </div>
                  <div className="lp-phone-greeting">Olá, João! 👋</div>
                  <div className="lp-phone-search">
                    <span>🔍</span> Buscar restaurantes...
                  </div>
                </div>
                <div className="lp-phone-cats">
                  <span className="lp-phone-cat active">🔥 Todos</span>
                  <span className="lp-phone-cat">🍕 Pizzas</span>
                  <span className="lp-phone-cat">🍔 Lanches</span>
                  <span className="lp-phone-cat">🍣 Japonesa</span>
                </div>
                <div className="lp-phone-stores">
                  <div className="lp-phone-store">
                    <div className="lp-phone-store-logo">🍕</div>
                    <div>
                      <div className="lp-phone-store-name">Pizza Palace</div>
                      <div className="lp-phone-store-meta">★ 4.8 · 25-35 min · Frete R$5,90</div>
                    </div>
                  </div>
                  <div className="lp-phone-store">
                    <div className="lp-phone-store-logo">🍔</div>
                    <div>
                      <div className="lp-phone-store-name">Burger House</div>
                      <div className="lp-phone-store-meta">★ 4.6 · 20-30 min · Grátis</div>
                    </div>
                  </div>
                  <div className="lp-phone-store">
                    <div className="lp-phone-store-logo">🍣</div>
                    <div>
                      <div className="lp-phone-store-name">Sushi Total</div>
                      <div className="lp-phone-store-meta">★ 4.9 · 30-45 min · R$8,00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats">
        <div className="lp-container lp-stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="lp-stat">
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lp-section lp-how" id="como-funciona">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Simples assim</span>
            <h2>Como Funciona</h2>
            <p>Em 3 passos simples, sua loja já está recebendo pedidos</p>
          </div>
          <div className="lp-how-grid">
            {HOW_STEPS.map(s => (
              <div key={s.num} className="lp-how-card">
                <div className="lp-how-num">{s.num}</div>
                <div className="lp-how-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA LOJAS */}
      <section className="lp-section lp-section-alt" id="lojas">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Para Lojistas</span>
            <h2>Tudo que sua loja precisa</h2>
            <p>Gerencie pedidos, cardápio, pagamentos e relatórios em um só lugar</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES_STORE.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA ENTREGADORES */}
      <section className="lp-section" id="entregadores">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Para Entregadores</span>
            <h2>Ganhe dinheiro com flexibilidade</h2>
            <p>Escolha seus horários, aceite pedidos e acompanhe seus ganhos</p>
          </div>
          <div className="lp-features-grid lp-features-4">
            {FEATURES_DELIVERYMAN.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA CLIENTES */}
      <section className="lp-section lp-section-alt" id="clientes">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Para Clientes</span>
            <h2>A melhor experiência de pedido</h2>
            <p>Busque, escolha, acompanhe e avalie — tudo com facilidade</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES_CLIENT.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <h2>Pronto para começar?</h2>
          <p>Junte-se a lojas, entregadores e clientes que já usam o Toop Delivery</p>
          <div className="lp-cta-buttons">
            <a href="/register" className="lp-btn lp-btn-lg lp-btn-white">
              Criar Conta Grátis <ArrowRight size={18} />
            </a>
            <a href="mailto:contato@toopdelivery.com.br" className="lp-btn lp-btn-lg lp-btn-ghost-white">
              <Mail size={18} /> Fale Conosco
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-logo">
              <span className="lp-logo-icon">🛵</span>
              <span className="lp-logo-text">Toop<span>Delivery</span></span>
            </span>
            <p>A plataforma completa de delivery para o Brasil.</p>
          </div>
          <div className="lp-footer-links">
            <div>
              <h4>Produto</h4>
              <a href="#lojas">Para Lojas</a>
              <a href="#entregadores">Para Entregadores</a>
              <a href="#clientes">Para Clientes</a>
              <a href="#como-funciona">Como Funciona</a>
            </div>
            <div>
              <h4>Empresa</h4>
              <a href="#">Sobre Nós</a>
              <a href="#">Blog</a>
              <a href="#">Carreiras</a>
              <a href="#">Contato</a>
            </div>
            <div>
              <h4>Suporte</h4>
              <a href="#">Central de Ajuda</a>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Status</a>
            </div>
          </div>
        </div>
        <div className="lp-container lp-footer-bottom">
          <p>© 2026 Toop Delivery. Todos os direitos reservados.</p>
          <div className="lp-footer-social">
            <a href="#"><ExternalLink size={18} /></a>
            <a href="#"><Phone size={18} /></a>
            <a href="#"><Mail size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
