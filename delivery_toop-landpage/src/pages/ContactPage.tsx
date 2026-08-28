import { useState, type FormEvent } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'

const CONTACT_CHANNELS = [
  { icon: <Mail size={24} />, title: 'Email', desc: 'contato@gojadelivery.com.br', href: 'mailto:contato@gojadelivery.com.br' },
  { icon: <Phone size={24} />, title: 'Telefone', desc: '+55 (11) 4002-8922', href: 'tel:+551140028922' },
  { icon: <MapPin size={24} />, title: 'Sede', desc: 'São Paulo, SP · Brasil', href: '#' },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    const subject = encodeURIComponent(form.subject || 'Contato via site')
    const body = encodeURIComponent(`Nome: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    setTimeout(() => {
      window.location.href = `mailto:contato@gojadelivery.com.br?subject=${subject}&body=${body}`
      setSending(false)
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    }, 400)
  }

  const cta = [] as { label: string; href: string }[]

  return (
    <SiteFrame active="contact" cta={cta}>
      {/* HERO */}
      <section className="lp-hero lp-hero-contact">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">💬 Fale Conosco</div>
            <h1>
              Estamos aqui para<br />
              <span className="lp-hero-highlight">ajudar você</span>
            </h1>
            <p className="lp-hero-sub">
              Dúvidas, sugestões, parcerias ou suporte? Envie sua mensagem e nossa equipe
              retornará o mais rápido possível.
            </p>
          </div>
          <div className="lp-contact-hero-visual">
            {CONTACT_CHANNELS.map(c => (
              <a key={c.title} href={c.href} className="lp-contact-channel">
                <div className="lp-contact-channel-icon">{c.icon}</div>
                <div>
                  <div className="lp-contact-channel-title">{c.title}</div>
                  <div className="lp-contact-channel-desc">{c.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="lp-section lp-section-alt" id="form">
        <div className="lp-container lp-contact-form-wrap">
          <div className="lp-section-header">
            <span className="lp-section-tag">Envie sua mensagem</span>
            <h2>Como podemos ajudar?</h2>
            <p>Preencha o formulário abaixo e entraremos em contato</p>
          </div>

          <div className="lp-contact-form-card">
            {sent && (
              <div className="lp-contact-success">
                <CheckCircle size={20} /> Mensagem pronta! Seu aplicativo de email abrirá para enviar.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="lp-form-row">
                <div className="lp-form-field">
                  <label htmlFor="name">Nome *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="lp-form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="lp-form-field">
                <label htmlFor="subject">Assunto</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Selecione um assunto</option>
                  <option value="Quero ser lojista">Quero ser lojista</option>
                  <option value="Quero ser motorista">Quero ser motorista</option>
                  <option value="Suporte técnico">Suporte técnico</option>
                  <option value="Parcerias">Parcerias</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="lp-form-field">
                <label htmlFor="message">Mensagem *</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Escreva sua mensagem aqui..."
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className="lp-btn lp-btn-lg" disabled={sending}>
                <Send size={18} /> {sending ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
