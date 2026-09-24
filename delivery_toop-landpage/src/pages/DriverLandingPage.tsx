import { Link } from 'react-router-dom'
import {
  Truck, Car, ArrowRight, MapPin, TrendingUp, Star, Zap, Navigation,
  CheckCircle, Wallet, Clock, HandCoins, Radio, Target, Mail, Smartphone
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
  return (
    <SiteFrame active="driver">
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

      {/* BAIXE O APP DO ENTREGADOR */}
      <section className="lp-section lp-section-apps" id="app">
        <div className="lp-container">
          <div className="lp-apps-inner">
            <div className="lp-apps-text">
              <span className="lp-section-tag">Baixe o App</span>
              <h2>Receba entregas direto no celular</h2>
              <p>Baixe o app do entregador e comece a ganhar: avisos de novos pedidos, rota no Maps e ganhos em tempo real.</p>
              <div className="lp-apps-buttons">
                <a href={LINKS.storeAppGoogleEntregador || '#'} className="lp-store-badge" target="_blank" rel="noopener noreferrer" aria-label="Baixar APK Android Entregador">
                  <svg width="26" height="30" viewBox="0 0 26 30" fill="currentColor" aria-hidden="true"><path d="M1.9 0.2C0.8 0.9 0.2 2.1 0.2 3.5v23c0 1.4 0.6 2.6 1.7 3.3L13.4 15 1.9 0.2z"/><path d="M16.6 10.4l-4.8-4.8L25.4 14.5c0.8 0.8 0.8 2.4 0 3.2L11.8 26.4l4.8-4.8 8.4-3.2 1.2-0.5c0.8-0.3 0.8-1.2 0-1.5l-1.3-0.5-8.3-2.5z" opacity="0.85"/><path d="M1.9 29.8l11.5-14.5-11.5-14.5C0.9 1.4 0.2 2.6 0.2 3.9V26.1C0.2 27.4 0.9 28.6 1.9 29.8z"/></svg>
                  <span className="lp-store-badge-text">
                    <small>Baixar para</small>
                    <strong>Android</strong>
                  </span>
                </a>
                <span className="lp-store-badge lp-store-badge-disabled" aria-label="Em breve na App Store">
                  <svg width="24" height="30" viewBox="0 0 24 30" fill="currentColor" aria-hidden="true"><path d="M20.2 25.7c-1.3 1.9-2.7 3.8-4.9 3.8-2.1 0-2.8-1.3-5.3-1.3s-3.2 1.3-5.3 1.3c-2.1 0-3.6-2.1-5-4C-2.1 20.7-2.6 12.2 1.9 8.6 3.7 6.7 6.4 5.7 8.8 5.7c2.3 0 4.5 1.3 5.9 1.3 1.5 0 3.9-1.6 6.9-1.3 1.2 0 4.5 0.5 6.6 3.7-0.2 0.1-3.6 2.1-3.6 6.4 0 4.9 4.3 6.5 4.4 6.6-0.1 0.2-0.7 2.4-2.2 4.7-1.4 2.1-2.8 4.1-5 4.1-1.9-0.5-2.4-1.3-4.6-1.6-1.9 0.3-2.5 0.9-4.4 0.9-2 0-3.6-1.7-4.9-3.7zM13.3 0.3c-0.2 2.3 0.8 4.5 2.3 6.1 1.5 1.7 4.1 2.9 6.2 2.6 0.3-2.4-1-4.7-2.5-6.1C17.6 1.6 15.2 0.6 13.3 0.3z"/></svg>
                  <span className="lp-store-badge-text">
                    <small>Em breve na</small>
                    <strong>App Store</strong>
                  </span>
                </span>
              </div>
              <div className="lp-apps-note"><Smartphone size={16} /> Compatível com Android e iOS</div>
            </div>
            <div className="lp-apps-visual">
              <div className="lp-hero-phone">
                <div className="lp-phone-screen">
                  <div className="lp-phone-header">
                    <div className="lp-phone-statusbar"><span>9:41</span><span>🔋 📶</span></div>
                    <div className="lp-phone-greeting">Pronto pra rodar? 🛵</div>
                    <div className="lp-phone-search"><span>🔍</span> Buscar entregas próximas...</div>
                  </div>
                  <div className="lp-phone-cats">
                    <span className="lp-phone-cat active">🔥 Novas</span>
                    <span className="lp-phone-cat">🍕 Restaurantes</span>
                  </div>
                  <div className="lp-phone-stores">
                    <div className="lp-phone-store">
                      <span className="lp-phone-store-logo">📦</span>
                      <div style={{ flex: 1 }}>
                        <div className="lp-phone-store-name">Pizza Palace</div>
                        <div className="lp-phone-store-meta">3,2km · 25 min · R$ 12,00</div>
                      </div>
                      <span className="lp-phone-cat active">Aceitar</span>
                    </div>
                    <div className="lp-phone-store">
                      <span className="lp-phone-store-logo">🛍️</span>
                      <div style={{ flex: 1 }}>
                        <div className="lp-phone-store-name">Mercado Bom Preço</div>
                        <div className="lp-phone-store-meta">1,8km · 15 min · R$ 8,50</div>
                      </div>
                      <span className="lp-phone-cat active">Aceitar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            <Link to="/contato" className="lp-btn lp-btn-lg lp-btn-ghost-white">
              <Mail size={18} /> Fale Conosco
            </Link>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
