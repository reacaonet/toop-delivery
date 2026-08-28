import { Link } from 'react-router-dom'
import {
  Store, Truck, ShoppingBag, ArrowRight, CheckCircle, Clock, Star,
  MapPin, BarChart3, Bell, Shield, Zap, Users, TrendingUp,
  Phone, Mail, ExternalLink, HandCoins, Target, Radio, Navigation
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { LINKS } from '../constants'

const FEATURES_STORE = [
  { icon: <ShoppingBag size={24} />, title: 'Painel de Pedidos', desc: 'Gerencie todos os pedidos em tempo real com painel Kanban visual e intuitivo.' },
  { icon: <Store size={24} />, title: 'Cardápio Digital', desc: 'Cadastre categorias, produtos com fotos, preços e disponibilidade.' },
  { icon: <BarChart3 size={24} />, title: 'Relatórios Financeiros', desc: 'Acompanhe faturamento, comissões e pedidos por período.' },
  { icon: <TrendingUp size={24} />, title: 'Comissão Dinâmica', desc: 'Configuração transparente de taxas e comissões da plataforma.' },
]

const FEATURES_DELIVERYMAN = [
  { icon: <Zap size={24} />, title: 'Pedidos Disponíveis', desc: 'Veja pedidos prontos e escolha qual aceitar. Liberdade total.' },
  { icon: <MapPin size={24} />, title: 'Rota no Google Maps', desc: 'Abra a rota de entrega direto no Maps com um toque.' },
  { icon: <TrendingUp size={24} />, title: 'Ganhos do Dia', desc: 'Acompanhe seus ganhos em tempo real, pedido por pedido.' },
  { icon: <Star size={24} />, title: 'Avaliações', desc: 'Construa sua reputação com avaliações de clientes.' },
]

const DRIVER_SYSTEM = [
  { icon: <Target size={24} />, title: 'Transparência no Preço', desc: 'O cliente vê como o preço é formado: tarifa base, distância e alta demanda. Sem surpresas no fechamento.' },
  { icon: <HandCoins size={24} />, title: 'Negociação em Tempo Real', desc: 'Estilo InDrive: o cliente propõe o valor e o motorista contrapropõe ou aceita. Você decide quando o preço vale a pena.' },
  { icon: <Radio size={24} />, title: 'Motoristas Interessados', desc: 'Vários motoristas podem enviar propostas. O cliente escolhe quem atende, com nome, nota e veículo.' },
  { icon: <Navigation size={24} />, title: 'Rastreio ao Vivo', desc: 'Acompanhe a corrida no mapa em tempo real do início ao fim da viagem.' },
]

const STATS = [
  { value: '100%', label: 'Gratuito para começar' },
  { value: '24/7', label: 'Suporte disponível' },
  { value: '<5min', label: 'Tempo de cadastro' },
  { value: '∞', label: 'Pedidos sem limite' },
]

export default function LandingPage() {
  const cta = [
    { label: 'Entrar', href: LINKS.clientLogin, variant: 'outline' as const },
    { label: 'Cadastrar', href: LINKS.clientRegister },
  ]

  return (
    <SiteFrame active="home" cta={cta}>
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
              Uma plataforma completa para lojas, motoristas e clientes.
              Pedidos em tempo real, corridas com negociação de preço, rastreio e muito mais.
            </p>
            <div className="lp-hero-ctas">
              <a href={LINKS.clientRegister} className="lp-btn lp-btn-lg" target="_blank" rel="noopener noreferrer">
                Pedir Agora <ArrowRight size={18} />
              </a>
              <Link to="/lojista" className="lp-btn lp-btn-lg lp-btn-ghost">
                Ver para Lojas
              </Link>
              <Link to="/motorista" className="lp-btn lp-btn-lg lp-btn-ghost">
                Ser Motorista
              </Link>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Sem cartão de crédito</span>
              <span>✅ Setup em minutos</span>
              <span>✅ Pagamento transparente</span>
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

      {/* SISTEMA DE DRIVER */}
      <section className="lp-section" id="driver">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Sistema de Motoristas</span>
            <h2>Corridas com preço justo e negociável</h2>
            <p>O cliente vê como o preço é formado e o motorista decide se aceita, contrapropõe ou recusa</p>
          </div>
          <div className="lp-features-grid">
            {DRIVER_SYSTEM.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="lp-driver-cta">
            <Link to="/motorista" className="lp-btn lp-btn-lg">
              Conhecer o app de Motoristas <ArrowRight size={18} />
            </Link>
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
          <div className="lp-driver-cta">
            <Link to="/lojista" className="lp-btn lp-btn-lg">
              Abrir minha Loja <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PARA MOTORISTAS */}
      <section className="lp-section" id="motoristas">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Para Motoristas</span>
            <h2>Ganhe dinheiro com flexibilidade</h2>
            <p>Escolha seus horários, negocie preços e acompanhe seus ganhos</p>
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
          <div className="lp-driver-cta">
            <Link to="/motorista" className="lp-btn lp-btn-lg">
              Começar a entregar <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <h2>Pronto para começar?</h2>
          <p>Junte-se a lojas, motoristas e clientes que já usam o Gojá Delivery</p>
          <div className="lp-cta-buttons">
            <a href={LINKS.clientRegister} className="lp-btn lp-btn-lg lp-btn-white" target="_blank" rel="noopener noreferrer">
              Criar Conta Grátis <ArrowRight size={18} />
            </a>
            <a href="mailto:contato@toopdelivery.com.br" className="lp-btn lp-btn-lg lp-btn-ghost-white">
              <Mail size={18} /> Fale Conosco
            </a>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
