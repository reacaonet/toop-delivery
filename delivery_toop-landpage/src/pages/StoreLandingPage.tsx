import {
  Store, ShoppingBag, ArrowRight, Clock, Bell, BarChart3, TrendingUp,
  CheckCircle, Users, CreditCard, Package, ShieldCheck, Building2, Mail
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { LINKS } from '../constants'

const FEATURES = [
  { icon: <ShoppingBag size={24} />, title: 'Painel de Pedidos', desc: 'Gerencie todos os pedidos em tempo real com um painel visual e intuitivo.' },
  { icon: <Store size={24} />, title: 'Cardápio Digital', desc: 'Cadastre categorias, produtos com fotos, preços e disponibilidade.' },
  { icon: <Clock size={24} />, title: 'Horário de Funcionamento', desc: 'Configure horários por dia da semana. Loja automaticamente mostra aberto/fechado.' },
  { icon: <Bell size={24} />, title: 'Notificações', desc: 'Receba alertas instantâneos quando novos pedidos chegarem.' },
  { icon: <BarChart3 size={24} />, title: 'Relatórios Financeiros', desc: 'Acompanhe faturamento, comissões, pedidos por período e ranking de produtos.' },
  { icon: <TrendingUp size={24} />, title: 'Comissão Dinâmica', desc: 'Configuração transparente de taxas de entrega e comissão da plataforma.' },
  { icon: <Package size={24} />, title: 'Gestão de Estoque', desc: 'Controle entradas, saídas, lotes e filiais do seu estoque.' },
  { icon: <CreditCard size={24} />, title: 'Pagamentos', desc: 'Aceite PIX, cartão e dinheiro. Acompanhe seus repasses.' },
  { icon: <Users size={24} />, title: 'Múltiplos Usuários', desc: 'Adicione colaboradores com permissões para operar o painel da loja.' },
]

const STEPS = [
  { num: '01', title: 'Cadastre sua Loja', desc: 'Crie sua conta gratuita em poucos minutos com nome, email e senha.', icon: <Store size={32} /> },
  { num: '02', title: 'Configure seu Cardápio', desc: 'Adicione categorias, produtos com fotos, preços e tempos de preparo.', icon: <ShoppingBag size={32} /> },
  { num: '03', title: 'Receba Pedidos', desc: 'Pedidos chegam em tempo real. Acompanhe do início ao fim com o painel.', icon: <CheckCircle size={32} /> },
]

const STATS = [
  { value: '0%', label: 'Taxa para começar' },
  { value: '24/7', label: 'Suporte disponível' },
  { value: '<5min', label: 'Tempo de cadastro' },
  { value: '∞', label: 'Pedidos sem limite' },
]

export default function StoreLandingPage() {
  const cta = [
    { label: 'Entrar', href: LINKS.storeLogin, variant: 'outline' as const },
    { label: 'Cadastrar', href: LINKS.storeRegister },
  ]

  return (
    <SiteFrame active="store" cta={cta}>
      {/* HERO */}
      <section className="lp-hero lp-hero-store">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">🏪 Para Lojistas</div>
            <h1>
              Aumente as vendas da<br />
              <span className="lp-hero-highlight">sua loja com delivery</span>
            </h1>
            <p className="lp-hero-sub">
              Painel completo de pedidos, cardápio digital, gestão de estoque,
              relatórios financeiros e muito mais — para lojas de todos os tamanhos.
            </p>
            <div className="lp-hero-ctas">
              <a href={LINKS.storeRegister} className="lp-btn lp-btn-lg" target="_blank" rel="noopener noreferrer">
                Abrir minha Loja <ArrowRight size={18} />
              </a>
              <a href={LINKS.storeLogin} className="lp-btn lp-btn-lg lp-btn-ghost" target="_blank" rel="noopener noreferrer">
                Já tenho conta
              </a>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Sem taxa de abertura</span>
              <span>✅ Cadastro em minutos</span>
              <span>✅ Comissão transparente</span>
            </div>
          </div>
          <div className="lp-hero-visual lp-hero-card-visual">
            <div className="lp-hero-card">
              <div className="lp-hero-card-head">
                <div className="lp-hero-card-logo"><Store size={20} /></div>
                <div>
                  <div className="lp-hero-card-title">Painel da Loja</div>
                  <div className="lp-hero-card-sub">Pizza Palace · Aberto</div>
                </div>
              </div>
              <div className="lp-hero-card-stat">
                <div>
                  <span className="lp-hero-card-value">R$ 4.850</span>
                  <span className="lp-hero-card-label">Faturamento de hoje</span>
                </div>
              </div>
              <div className="lp-hero-card-orders">
                <span className="lp-hero-card-pill">🍕 Novo pedido</span>
                <span className="lp-hero-card-pill">🚚 Em entrega</span>
                <span className="lp-hero-card-pill">✅ 5 concluídos</span>
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
            <p>Em 3 passos simples, sua loja já está recebendo pedidos</p>
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

      {/* RECURSOS */}
      <section className="lp-section lp-section-alt" id="recursos">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Recursos</span>
            <h2>Ferramentas para crescer</h2>
            <p>Tudo que sua loja precisa em um só lugar</p>
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
          <h2>Leve sua loja para o digital</h2>
          <p>Cadastre-se grátis e comece a receber pedidos hoje mesmo</p>
          <div className="lp-cta-buttons">
            <a href={LINKS.storeRegister} className="lp-btn lp-btn-lg lp-btn-white" target="_blank" rel="noopener noreferrer">
              Cadastrar Loja <ArrowRight size={18} />
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
