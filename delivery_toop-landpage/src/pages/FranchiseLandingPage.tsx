import { Link } from 'react-router-dom'
import {
  Store, ArrowRight, Building2, Shield, BarChart3, TrendingUp,
  CheckCircle, Network, Users, CreditCard, Rocket, Mail
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'

const FEATURES = [
  { icon: <Network size={24} />, title: 'Operação Multi-Empresa', desc: 'Gerencie todas as lojas da sua franquia em um único painel, com métricas por unidade.' },
  { icon: <Building2 size={24} />, title: 'Expansão de Marca', desc: 'Padronize cardápios, produtos e preços em todas as unidades da sua rede.' },
  { icon: <BarChart3 size={24} />, title: 'Relatórios por Franquia', desc: 'Faturamento, comissões e rankings individuais para acompanhar cada operação.' },
  { icon: <Users size={24} />, title: 'Times e Permissões', desc: 'Defina perfis e permissões de acesso para cada colaborador e unidade.' },
  { icon: <CreditCard size={24} />, title: 'Repasses Centralizados', desc: 'Comissões e repasses consolidados para a rede, com transparência de taxas.' },
  { icon: <Shield size={24} />, title: 'Controle de Regras', desc: 'Curadoria de status, categorias e ofertas aplicadas globalmente na franquia.' },
]

const BENEFITS = [
  { icon: <CheckCircle size={20} />, title: 'Marca reconhecida', desc: 'Sua bandeira visível para milhares de clientes na plataforma.' },
  { icon: <Rocket size={20} />, title: 'Onboarding acelerado', desc: 'Unidades novas configuradas em minutos com modelos prontos.' },
  { icon: <TrendingUp size={20} />, title: 'Crescimento regional', desc: 'Expanda por regiões inteiras com operação monitorada à distância.' },
]

const STATS = [
  { value: '1 Painel', label: 'Controle de toda a rede' },
  { value: '24/7', label: 'Suporte dedicado' },
  { value: '∞', label: 'Unidades sem limite' },
  { value: '100%', label: 'Transparência de repasses' },
]

export default function FranchiseLandingPage() {
  return (
    <SiteFrame active="franchise">
      {/* HERO */}
      <section className="lp-hero lp-hero-franchise">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">🏢 Programa de Franquias</div>
            <h1>
              Expanda sua marca<br />
              <span className="lp-hero-highlight">com uma rede de delivery</span>
            </h1>
            <p className="lp-hero-sub">
              Opere múltiplas lojas com um painel único, relatórios por unidade,
              padronização de cardápio e repasses centralizados da sua franquia.
            </p>
            <div className="lp-hero-ctas">
              <Link to="/contato" className="lp-btn lp-btn-lg">
                Quero ser uma Franquia <ArrowRight size={18} />
              </Link>
              <Link to="/lojista" className="lp-btn lp-btn-lg lp-btn-ghost">
                Conhecer o painel de lojas
              </Link>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Gestão multi-loja</span>
              <span>✅ Sem custo fixo de plataforma</span>
              <span>✅ Suporte dedicado</span>
            </div>
          </div>
          <div className="lp-hero-visual lp-hero-card-visual">
            <div className="lp-hero-card">
              <div className="lp-hero-card-head">
                <div className="lp-hero-card-logo"><Store size={20} /></div>
                <div>
                  <div className="lp-hero-card-title">Painel da Franquia</div>
                  <div className="lp-hero-card-sub">Rede GoJá · 4 unidades</div>
                </div>
              </div>
              <div className="lp-hero-card-stat">
                <div>
                  <span className="lp-hero-card-value">R$ 96.300</span>
                  <span className="lp-hero-card-label">Faturamento da rede (30 dias)</span>
                </div>
              </div>
              <div className="lp-hero-card-orders">
                <span className="lp-hero-card-pill">🏬 Centro · R$ 32.400</span>
                <span className="lp-hero-card-pill">🏬 Zona Sul · R$ 28.900</span>
                <span className="lp-hero-card-pill">🏬 Shopping · R$ 35.000</span>
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

      {/* MISSÃO / BENEFÍCIOS */}
      <section className="lp-section" id="programa">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Programa</span>
            <h2>Feito para quem quer crescer</h2>
            <p>Vantagens de operar sua rede de delivery com a GoJá</p>
          </div>
          <div className="lp-features-grid">
            {BENEFITS.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section className="lp-section lp-section-alt" id="recursos">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Recursos de Franquia</span>
            <h2>Controle uma rede inteira</h2>
            <p>Ferramentas de gestão central para operadores de franquia</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(f => (
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
          <h2>Vamos operar sua franquia juntos?</h2>
          <p>Fale com nosso time de expansão e veja como a GoJá estrutura redes de delivery</p>
          <div className="lp-cta-buttons">
            <Link to="/contato" className="lp-btn lp-btn-lg lp-btn-white">
              Falar com Vendas <ArrowRight size={18} />
            </Link>
            <Link to="/lojista" className="lp-btn lp-btn-lg lp-btn-ghost-white">
              <Store size={18} /> Ver para Lojas
            </Link>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}