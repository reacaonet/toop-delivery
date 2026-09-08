import { Link } from 'react-router-dom'
import {
  Store, ShoppingCart, ArrowRight, Clock, Bell, BarChart3,
  CheckCircle, Users, CreditCard, Package, ScanBarcode, Mail
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { LINKS } from '../constants'

const FEATURES = [
  { icon: <ScanBarcode size={24} />, title: 'Catálogo com Código de Barras', desc: 'Cadastre produtos com código de barras e banco de imagens ECBR integrado para agilizar o catálogo.' },
  { icon: <ShoppingCart size={24} />, title: 'Carrinho Completo', desc: 'Compras por departamento, itens por peso ou unidade e avaliação de entregas em tempo real.' },
  { icon: <Store size={24} />, title: 'Departamentos Online', desc: 'Organize o supermercado em departamentos digitais (mercearia, hortifrúti, bebidas, limpeza).' },
  { icon: <Clock size={24} />, title: 'Agendamento de Entrega', desc: 'O cliente agenda a melhor janela de entrega e acompanha o pedido do início ao fim.' },
  { icon: <Package size={24} />, title: 'Gestão de Estoque', desc: 'Controle entradas, saídas, lotes e filiais. Alerta automático de estoque mínimo.' },
  { icon: <CreditCard size={24} />, title: 'Pagamento no App', desc: 'Cartão, PIX e dinheiro na entrega. Sem filas, sem caixa físico.' },
  { icon: <Bell size={24} />, title: 'Novos Pedidos em Tempo Real', desc: 'Receba pedidos na hora com sons e alertas no painel da loja.' },
  { icon: <BarChart3 size={24} />, title: 'Relatórios de Vendas', desc: 'Acompanhe faturamento, ticket médio e produtos mais vendidos por período.' },
  { icon: <Users size={24} />, title: 'Múltiplos Colaboradores', desc: 'Equipe de preparo e entregadores com perfis e permissões próprias.' },
]

const STEPS = [
  { num: '01', title: 'Cadastre seu Supermercado', desc: 'Crie sua conta gratuita e configure os dados da empresa.', icon: <Store size={32} /> },
  { num: '02', title: 'Monte o Catálogo', desc: 'Importe o catálogo com código de barras, departamentos e preços.', icon: <ScanBarcode size={32} /> },
  { num: '03', title: 'Receba e Separe Pedidos', desc: 'Pedidos chegam no painel. Separe, confirme e envie a entrega.', icon: <CheckCircle size={32} /> },
]

const STATS = [
  { value: '0%', label: 'Taxa para começar' },
  { value: '24/7', label: 'Suporte disponível' },
  { value: '<5min', label: 'Tempo de cadastro' },
  { value: '∞', label: 'Pedidos sem limite' },
]

export default function SupermarketLandingPage() {
  return (
    <SiteFrame active="supermarket">
      {/* HERO */}
      <section className="lp-hero lp-hero-store">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">🛒 Para Supermercados</div>
            <h1>
              Seu supermercado<br />
              <span className="lp-hero-highlight">compras online e entrega</span>
            </h1>
            <p className="lp-hero-sub">
              Catálogo digital com código de barras, departamentos, agendamento de entregas,
              pagamento no app e painel completo de pedidos para o seu supermercado.
            </p>
            <div className="lp-hero-ctas">
              <a href={LINKS.storeRegister} className="lp-btn lp-btn-lg" target="_blank" rel="noopener noreferrer">
                Cadastrar Supermercado <ArrowRight size={18} />
              </a>
              <a href={LINKS.storeLogin} className="lp-btn lp-btn-lg lp-btn-ghost" target="_blank" rel="noopener noreferrer">
                Já tenho conta
              </a>
            </div>
            <div className="lp-hero-trust">
              <span>✅ Sem taxa de abertura</span>
              <span>✅ Cadastro em minutos</span>
              <span>✅ Catálogo via código de barras</span>
            </div>
          </div>
          <div className="lp-hero-visual lp-hero-card-visual">
            <div className="lp-hero-card">
              <div className="lp-hero-card-head">
                <div className="lp-hero-card-logo"><Store size={20} /></div>
                <div>
                  <div className="lp-hero-card-title">Painel do Supermercado</div>
                  <div className="lp-hero-card-sub">Mercadão GoJá · Novos pedidos</div>
                </div>
              </div>
              <div className="lp-hero-card-stat">
                <div>
                  <span className="lp-hero-card-value">R$ 8.240</span>
                  <span className="lp-hero-card-label">Vendas de hoje</span>
                </div>
              </div>
              <div className="lp-hero-card-orders">
                <span className="lp-hero-card-pill">🛒 Novo pedido · 18 itens</span>
                <span className="lp-hero-card-pill">🚚 3 entregas a caminho</span>
                <span className="lp-hero-card-pill">✅ 12 pedidos concluídos</span>
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
            <p>Do catálogo à entrega, tudo passa pelo seu painel</p>
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
            <span className="lp-section-tag">Recursos para Supermercados</span>
            <h2>O e-commerce completo do seu mercado</h2>
            <p>Ferramentas para vender mais, com menos esforço operacional</p>
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
          <div className="lp-driver-cta">
            <Link to="/lojista" className="lp-btn lp-btn-lg">
              Conhecer o painel de lojas <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <h2>Leve seu supermercado para o digital</h2>
          <p>Cadastre-se grátis e comece a receber pedidos online hoje mesmo</p>
          <div className="lp-cta-buttons">
            <a href={LINKS.storeRegister} className="lp-btn lp-btn-lg lp-btn-white" target="_blank" rel="noopener noreferrer">
              Cadastrar Supermercado <ArrowRight size={18} />
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