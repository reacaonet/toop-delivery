import {
  Truck, Car, ArrowRight, MapPin, TrendingUp, Star, Zap, Navigation,
  CheckCircle, Wallet, Clock, ShieldCheck, HandCoins, Radio, Target, Mail
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { LINKS } from '../constants'

const FEATURES_DELIVERY = [
  { icon: <Zap size={24} />, title: 'Entregas Disponíveis', desc: 'Veja pedidos prontos e escolha qual aceitar. Liberdade total.' },
  { icon: <MapPin size={24} />, title: 'Rota no Google Maps', desc: 'Abra a rota de entrega direto no Maps com um toque.' },
  { icon: <TrendingUp size={24} />, title: 'Ganhos do Dia', desc: 'Acompanhe seus ganhos em tempo real, pedido por pedido.' },
  { icon: <Star size={24} />, title: 'Avaliações', desc: 'Construa sua reputação com avaliações de clientes.' },
]

const FEATURES_RIDES = [
  { icon: <Target size={24} />, title: 'Preço Transparente', desc: 'Veja como o preço é formado: tarifa base, distância e alta demanda.' },
  { icon: <HandCoins size={24} />, title: 'Aceitar ou Contrapor', desc: 'O cliente propõe um valor e você aceita, recusa ou contrapropõe.' },
  { icon: <Radio size={24} />, title: 'Ser Escolhido', desc: 'Concorra enviando propostas. O cliente escolhe o motorista ideal.' },
  { icon: <Navigation size={24} />, title: 'Rastreio ao Vivo', desc: 'Siga a rota no mapa em tempo real do início ao fim.' },
]

const STEPS = [
  { num: '01', title: 'Cadastre-se', desc: 'Crie sua conta como motorista em poucos minutos.', icon: <CheckCircle size={32} /> },
  { num: '02', title: 'Aceite Entregas e Corridas', desc: 'Escolha as entregas e corridas que valem a pena para você.', icon: <Car size={32} /> },
  { num: '03', title: 'Receba Seus Ganhos', desc: 'Acompanhe seus ganhos e receba na sua conta.', icon: <Wallet size={32} /> },
]

const STATS = [
  { value: '100%', label: 'Flexibilidade total' },
  { value: '24/7', label: 'Entregue quando quiser' },
  { value: 'R$', label: 'Ganhos por entrega' },
  { value: '★', label: 'Construa sua reputação' },
]

export default function DriverLandingPage() {
  const cta = [
    { label: 'Entrar', href: LINKS.deliverymanLogin, variant: 'outline' as const },
    { label: 'Cadastrar', href: LINKS.deliverymanRegister },
  ]

  return (
    <SiteFrame active="driver" cta={cta}>
      {/* HERO */}
      <section className="lp-hero lp-hero-driver">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">🛵 Para Motoristas e Entregadores</div>
            <h1>
              Ganhe dinheiro com<br />
              <span className="lp-hero-highlight">flexibilidade total</span>
            </h1>
            <p className="lp-hero-sub">
              Entregue pedidos e faça corridas pagando bem. Escolha seus horários,
              negocie o preço das corridas e acompanhe seus ganhos em tempo real.
            </p>
            <div className="lp-hero-ctas">
              <a href={LINKS.deliverymanRegister} className="lp-btn lp-btn-lg" target="_blank" rel="noopener noreferrer">
                Cadastrar como Entregador <ArrowRight size={18} />
              </a>
              <a href={LINKS.deliverymanLogin} className="lp-btn lp-btn-lg lp-btn-ghost" target="_blank" rel="noopener noreferrer">
                Já sou entregador
              </a>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Sem exclusividade</span>
              <span>✅ Receba por entrega</span>
              <span>✅ Sac conforme quiser</span>
            </div>
          </div>
          <div className="lp-hero-visual lp-hero-driver-visual">
            <div className="lp-hero-driver-card">
              <div className="lp-hero-driver-head">
                <div className="lp-hero-driver-avatar">👤</div>
                <div>
                  <div className="lp-hero-driver-title">Bom dia, Carlos! 👋</div>
                  <div className="lp-hero-driver-sub">Disponível para entregas</div>
                </div>
              </div>
              <div className="lp-hero-driver-online">
                <span className="lp-driver-dot" /> Online
              </div>
              <div className="lp-hero-driver-action">
                <div className="lp-hero-driver-action-logo">📦</div>
                <div>
                  <div className="lp-hero-driver-action-title">Pizza Palace · R$ 12,00</div>
                  <div className="lp-hero-driver-action-sub">Dist. 3,2km · 25 min</div>
                </div>
                <span className="lp-hero-driver-accept">Aceitar</span>
              </div>
              <div className="lp-hero-driver-wrap">
                <div className="lp-hero-card-stat">
                  <div>
                    <span className="lp-hero-card-value">R$ 148,50</span>
                    <span className="lp-hero-card-label">Ganhos de hoje</span>
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
      <section className="lp-section" id="como-funciona">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Simples assim</span>
            <h2>Como Funciona</h2>
            <p>Em 3 passos, você começa a ganhar</p>
          </div>
          <div className="lp-how-grid">
            {STEPS.map(s => (
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

      {/* ENTREGAS */}
      <section className="lp-section lp-section-alt" id="entregas">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Entregas de Comida</span>
            <h2>Entregue e ganhe por pedido</h2>
            <p>Receba pedidos de restaurantes e decida quais aceitar</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES_DELIVERY.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORRIDAS */}
      <section className="lp-section" id="corridas">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Sistema de Corridas</span>
            <h2>Corridas com preço que vale a pena</h2>
            <p>Negocie o valor das corridas em tempo real</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES_RIDES.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="lp-driver-cta">
            <a href={LINKS.deliverymanRegister} className="lp-btn lp-btn-lg" target="_blank" rel="noopener noreferrer">
              Começar a rodar <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <h2>Pronto para começar a ganhar?</h2>
          <p>Cadastre-se como motorista ou entregador e trabalhe no seu ritmo</p>
          <div className="lp-cta-buttons">
            <a href={LINKS.deliverymanRegister} className="lp-btn lp-btn-lg lp-btn-white" target="_blank" rel="noopener noreferrer">
              Cadastrar Agora <ArrowRight size={18} />
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
