import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

interface FaqItem { _id: string; title: string; caption: string; description: string; status: boolean }
interface ContactInfo { supportEmail: string; supportPhone: string; whatsapp: string; website: string; supportHours: string }
interface Ticket { _id: string; tickedId: string; subject: string; status: string; createdAt: string; description?: string; interactions?: TicketInteraction[] }
interface TicketInteraction { _id: string; origin: string; author?: string; description: string; createdAt: string }

type Tab = 'faq' | 'contact' | 'tickets'

const DEPARTMENTS = [
  { value: 'SUPPORT', label: 'Suporte' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'ADMINISTRATIVE', label: 'Administrativo' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'FINANCIAL', label: 'Financeiro' },
  { value: 'TI', label: 'TI' },
]

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo', IN_PROGRESS: 'Em andamento', ON_HOLD: 'Em espera', SOLVED: 'Resolvido'
}

export default function HelpPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('faq')

  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketLoading, setTicketLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [form, setForm] = useState({ subject: '', description: '', department: 'SUPPORT', priority: 'LOW' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/faq', { params: { status: 'true' } }).then(r => {
        const d = r.data
        setFaqs(Array.isArray(d) ? d : d?.data?.data ?? d?.data ?? [])
      }).catch(() => {}),
      api.get('/platform/contact').then(r => setContact(r.data?.data?.contact || r.data?.contact || null)).catch(() => {}),
      api.get('/helpdesk/tickets/my').then(r => {
        const d = r.data
        setTickets(Array.isArray(d) ? d : d?.data?.data ?? d?.data ?? [])
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [user])

  const loadTickets = async () => {
    try {
      const { data } = await api.get('/helpdesk/tickets/my')
      setTickets(Array.isArray(data) ? data : data?.data?.data ?? data?.data ?? [])
    } catch { /* ignore */ }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/helpdesk/tickets', form)
      showToast('Chamado aberto com sucesso!')
      setShowModal(false)
      setForm({ subject: '', description: '', department: 'SUPPORT', priority: 'LOW' })
      loadTickets()
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Erro ao abrir chamado', 'error')
    } finally { setSubmitting(false) }
  }

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setTicketLoading(true)
    try {
      const { data } = await api.get(`/helpdesk/tickets/protocol/${ticket.tickedId}`)
      const full = data?.data || data
      setSelectedTicket(full)
    } catch { /* use partial data */ }
    finally { setTicketLoading(false) }
  }

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return
    try {
      await api.post(`/helpdesk/tickets/${selectedTicket._id}/interactions`, { description: replyText.trim() })
      setReplyText('')
      const { data } = await api.get(`/helpdesk/tickets/protocol/${selectedTicket.tickedId}`)
      setSelectedTicket(data?.data || data)
      showToast('Resposta enviada')
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Erro ao enviar', 'error')
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Voltar</button>
      <h1 className="page-title">Ajuda</h1>

      <div className="help-tabs">
        <button className={`help-tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>Perguntas Frequentes</button>
        <button className={`help-tab ${tab === 'contact' ? 'active' : ''}`} onClick={() => setTab('contact')}>Contato</button>
        <button className={`help-tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>Meus Chamados</button>
      </div>

      {tab === 'faq' && (
        <div className="faq-list">
          {faqs.length === 0 ? (
            <div className="empty-state"><p>Nenhuma pergunta disponível</p></div>
          ) : faqs.map(f => (
            <div key={f._id} className="faq-item">
              <button className="faq-question" onClick={() => setExpandedFaq(expandedFaq === f._id ? null : f._id)}>
                <span>{f.title}</span>
                <span className="faq-toggle">{expandedFaq === f._id ? '−' : '+'}</span>
              </button>
              {expandedFaq === f._id && (
                <div className="faq-answer">
                  {f.caption && <p><em>{f.caption}</em></p>}
                  <p>{f.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'contact' && (
        <div className="contact-card">
          {!contact ? <div className="empty-state"><p>Carregando...</p></div> : (
            <>
              {contact.supportEmail && <div className="contact-row"><strong>Email:</strong> <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a></div>}
              {contact.supportPhone && <div className="contact-row"><strong>Telefone:</strong> <a href={`tel:${contact.supportPhone}`}>{contact.supportPhone}</a></div>}
              {contact.whatsapp && <div className="contact-row"><strong>WhatsApp:</strong> <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{contact.whatsapp}</a></div>}
              {contact.website && <div className="contact-row"><strong>Site:</strong> <a href={contact.website} target="_blank" rel="noreferrer">{contact.website}</a></div>}
              {contact.supportHours && <div className="contact-row"><strong>Horário:</strong> {contact.supportHours}</div>}
            </>
          )}
        </div>
      )}

      {tab === 'tickets' && (
        <div className="tickets-section">
          <div style={{ marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Abrir Chamado</button>
          </div>
          {tickets.length === 0 ? (
            <div className="empty-state"><p>Nenhum chamado encontrado</p></div>
          ) : (
            <div className="tickets-list">
              {tickets.map(t => (
                <div key={t._id} className="ticket-item" onClick={() => openTicket(t)}>
                  <div className="ticket-header">
                    <strong>#{t.tickedId}</strong>
                    <span className={`status-badge status-${t.status === 'NEW' ? 'pending' : t.status === 'SOLVED' ? 'delivered' : 'confirmed'}`}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                  <p>{t.subject || 'Sem assunto'}</p>
                  <span className="notification-date">
                    {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Novo chamado */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Abrir Chamado</h3>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label>Assunto *</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Descreva brevemente" />
              </div>
              <div className="form-group">
                <label>Descrição *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} placeholder="Detalhe o problema ou dúvida" />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Departamento</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Prioridade</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do chamado */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>#{selectedTicket.tickedId}</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            {ticketLoading ? <div className="loading">Carregando...</div> : (
              <>
                <p><strong>{selectedTicket.subject}</strong></p>
                <p className="notification-date">{STATUS_LABELS[selectedTicket.status] || selectedTicket.status}</p>
                <hr style={{ margin: '12px 0', border: '0', borderTop: '1px solid var(--border)' }} />
                <div className="interactions-list">
                  {(selectedTicket.interactions || []).map(inter => (
                    <div key={inter._id} className={`interaction-item interaction-${inter.origin}`}>
                      <div className="interaction-header">
                        <span className="interaction-author">{inter.author || inter.origin}</span>
                        <span className="notification-date">
                          {new Date(inter.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p>{inter.description}</p>
                    </div>
                  ))}
                </div>
                {selectedTicket.status !== 'SOLVED' && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      className="form-input"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={3}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={!replyText.trim()} style={{ marginTop: '8px' }}>Enviar resposta</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
