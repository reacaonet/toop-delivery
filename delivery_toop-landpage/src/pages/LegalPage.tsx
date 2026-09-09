import { useLocation } from 'react-router-dom'
import SiteFrame from '../components/SiteFrame'

interface PolicySection {
  title: string
  body: string
}

interface Policy {
  title: string
  updated: string
  sections: PolicySection[]
}

const POLICIES: Record<string, Policy> = {
  termos: {
    title: 'Termos de Uso',
    updated: 'Última atualização: 08/09/2026',
    sections: [
      {
        title: '1. Aceitação dos termos',
        body: 'Ao acessar ou usar a plataforma GoJá Delivery, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.',
      },
      {
        title: '2. Uso da plataforma',
        body: 'A plataforma conecta clientes, lojas, supermercados, franquias e entregadores. O uso indevido, fraudes ou violações de segurança podem levar à suspensão da conta.',
      },
      {
        title: '3. Pedidos e pagamentos',
        body: 'Os pedidos são processados pelas lojas parceiras. Os valores exibidos no aplicativo são informativos e podem variar conforme taxas e disponibilidade.',
      },
      {
        title: '4. Limitação de responsabilidade',
        body: 'A GoJá Delivery não se responsabiliza por danos indiretos decorrentes do uso da plataforma, atuando como intermediária tecnológica entre clientes e estabelecimentos.',
      },
      {
        title: '5. Contato',
        body: 'Dúvidas sobre estes termos podem ser encaminhadas para contato@godelivery.app.br.',
      },
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    updated: 'Última atualização: 08/09/2026',
    sections: [
      {
        title: '1. Dados coletados',
        body: 'Coletamos dados de cadastro (nome, e-mail, telefone e endereço), dados de pedido e informações de uso da plataforma para melhorar nossos serviços.',
      },
      {
        title: '2. Uso dos dados',
        body: 'Utilizamos seus dados para processar pedidos, realizar entregas, emitir notas e pagamentos, além de melhorias de produto e comunicação sobre o serviço.',
      },
      {
        title: '3. Compartilhamento',
        body: 'Compartilhamos dados apenas com os estabelecimentos e entregadores envolvidos no seu pedido, e com processadores de pagamento de forma segura.',
      },
      {
        title: '4. Segurança',
        body: 'Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, alteração ou destruição.',
      },
      {
        title: '5. Seus direitos',
        body: 'Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento pelo e-mail contato@godelivery.app.br.',
      },
    ],
  },
  cookies: {
    title: 'Política de Cookies',
    updated: 'Última atualização: 08/09/2026',
    sections: [
      {
        title: '1. O que são cookies',
        body: 'Cookies são pequenos arquivos armazenados no seu dispositivo para melhorar a navegação, lembrar preferências e medir o desempenho do site.',
      },
      {
        title: '2. Cookies que utilizamos',
        body: 'Usamos cookies essenciais (funcionamento do site), de preferências (idioma e região) e de análise (entendimento do uso, de forma agregada).',
      },
      {
        title: '3. Gerenciamento',
        body: 'Você pode controlar ou desativar os cookies pelas configurações do seu navegador. A desativação pode afetar o funcionamento de alguns recursos.',
      },
      {
        title: '4. Contato',
        body: 'Para dúvidas sobre nossa política de cookies, fale conosco pelo e-mail contato@godelivery.app.br.',
      },
    ],
  },
}

export default function LegalPage() {
  const { pathname } = useLocation()
  const key = pathname.replace(/^\/+/, '') || 'termos'
  const policy = POLICIES[key] ?? POLICIES.termos

  return (
    <SiteFrame active="contact">
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Informações legais</span>
            <h2>{policy.title}</h2>
            <p className="lp-section-sub">{policy.updated}</p>
          </div>
          <div className="lp-legal-content">
            {policy.sections.map(s => (
              <div key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}