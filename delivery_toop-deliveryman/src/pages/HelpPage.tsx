import { useState, useEffect } from 'react'
import { ArrowLeft, HelpCircle, Phone, FileText, ChevronDown, ChevronUp, Plus, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

interface FaqItem { _id: string; title: string; caption: string; description: string }
interface ContactInfo { supportEmail: string; supportPhone: string; whatsapp: string; website: string; supportHours: string }
interface Ticket { _id: string; tickedId: string; subject: string; status: string; createdAt: string; interactions?: TicketInteraction[] }
interface TicketInteraction { _id: string; origin: string; author?: string; description: string; createdAt: string }

type Tab = 'faq' | 'contact' | 'tickets'
const DEPARTMENTS = [
  { value: 'SUPPORT', label: 'Suporte' }, { value: 'COMMERCIAL', label: 'Comercial' }, { value: 'TI', label: 'TI' },
]
const STATUS_LABELS: Record<string, string> = { NEW: 'Novo', IN_PROGRESS: 'Em andamento', ON_HOLD: 'Em espera', SOLVED: 'Resolvido' }

const HelpPage: React.FC = () => {
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
    Promise.all([
      api.get('/faq', { params: { status: 'true' } }).then(r => setFaqs(r.data?.data || [])).catch(() => {}),
      api.get('/platform/contact').then(r => setContact(r.data?.contact || null)).catch(() => {}),
      api.get('/helpdesk/tickets/my').then(r => setTickets(r.data?.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const loadTickets = async () => { try { const r = await api.get('/helpdesk/tickets/my'); setTickets(r.data?.data || []) } catch { /* */ } }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try { await api.post('/helpdesk/tickets', form); setShowModal(false); setForm({ subject: '', description: '', department: 'SUPPORT', priority: 'LOW' }); loadTickets() }
    catch { /* ignore */ }
    finally { setSubmitting(false) }
  }

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket); setTicketLoading(true)
    try { const r = await api.get(`/helpdesk/tickets/protocol/${ticket.tickedId}`); setSelectedTicket(r.data || ticket) }
    catch { /* use partial */ }
    finally { setTicketLoading(false) }
  }

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return
    try {
      await api.post(`/helpdesk/tickets/${selectedTicket._id}/interactions`, { description: replyText.trim() })
      setReplyText(''); const r = await api.get(`/helpdesk/tickets/protocol/${selectedTicket.tickedId}`); setSelectedTicket(r.data || selectedTicket)
    } catch { /* ignore */ }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="documents-page">
      <div className="earnings-header">
        <button className="btn-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1>Ajuda</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'faq' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('faq')}><HelpCircle size={14} /> FAQ</button>
        <button className={`btn ${tab === 'contact' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('contact')}><Phone size={14} /> Contato</button>
        <button className={`btn ${tab === 'tickets' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('tickets')}><FileText size={14} /> Chamados</button>
      </div>

      {tab === 'faq' && (
        <div className="stat-card" style={{ padding: 0 }}>
          {faqs.length === 0 ? <div className="empty-state">Nenhuma pergunta disponível</div> : faqs.map(f => (
            <div key={f._id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
              <button style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }} onClick={() => setExpandedFaq(expandedFaq === f._id ? null : f._id)}>
                <strong>{f.title}</strong>
                {expandedFaq === f._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedFaq === f._id && <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>{f.caption && <p><em>{f.caption}</em></p>}<p>{f.description}</p></div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'contact' && (
        <div className="stat-card">
          {!contact ? <div className="empty-state">Carregando...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contact.supportEmail && <div><strong>Email:</strong> <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a></div>}
              {contact.supportPhone && <div><strong>Telefone:</strong> <a href={`tel:${contact.supportPhone}`}>{contact.supportPhone}</a></div>}
              {contact.whatsapp && <div><strong>WhatsApp:</strong> <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{contact.whatsapp}</a></div>}
              {contact.website && <div><strong>Site:</strong> <a href={contact.website} target="_blank" rel="noreferrer">{contact.website}</a></div>}
              {contact.supportHours && <div><strong>Horário:</strong> {contact.supportHours}</div>}
            </div>
          )}
        </div>
      )}

      {tab === 'tickets' && (
        <div className="stat-card" style={{ padding: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Meus Chamados</strong>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Abrir Chamado</button>
          </div>
          {tickets.length === 0 ? <div className="empty-state">Nenhum chamado</div> : tickets.map(t => (
            <div key={t._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => openTicket(t)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>#{t.tickedId}</strong>
                <span className={`status-badge ${t.status === 'NEW' ? '' : t.status === 'SOLVED' ? 'online' : 'offline'}`}>{STATUS_LABELS[t.status] || t.status}</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>{t.subject || 'Sem assunto'}</p>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-field"><label>Assunto *</label><input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
            <div className="modal-field"><label>Descrição *</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} /></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="modal-field" style={{ flex: 1 }}><label>Depto</label><select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>{DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
              <div className="modal-field" style={{ flex: 1 }}><label>Prioridade</label><select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="modal-btn confirm" onClick={handleCreateTicket} disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>#{selectedTicket.tickedId}</strong>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            {ticketLoading ? <div className="loading"><div className="spinner-sm" /></div> : (
              <>
                <p style={{ margin: '8px 0' }}>{selectedTicket.subject}</p>
                <span className={`status-badge ${selectedTicket.status === 'SOLVED' ? 'online' : 'offline'}`}>{STATUS_LABELS[selectedTicket.status] || selectedTicket.status}</span>
                <div style={{ margin: '12px 0', borderTop: '1px solid var(--border)' }} />
                {(selectedTicket.interactions || []).map(inter => (
                  <div key={inter._id} className="modal-field" style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="status-badge">{inter.origin}</span><span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(inter.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                    <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{inter.description}</p>
                  </div>
                ))}
                {selectedTicket.status !== 'SOLVED' && (
                  <div style={{ marginTop: '8px' }}>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Sua resposta..." rows={3} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '8px', resize: 'vertical' }} />
                    <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={!replyText.trim()} style={{ marginTop: '8px' }}><Send size={14} /> Enviar</button>
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

export default HelpPage
