import { useState, useEffect } from 'react'
import { HelpCircle, MessageSquare, Phone, FileText, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface FaqItem { _id: string; title: string; caption: string; description: string; status: boolean }
interface ContactInfo { supportEmail: string; supportPhone: string; whatsapp: string; website: string; supportHours: string }
interface Ticket { _id: string; tickedId: string; subject: string; status: string; createdAt: string; interactions?: TicketInteraction[] }
interface TicketInteraction { _id: string; origin: string; author?: string; description: string; createdAt: string }

type Tab = 'faq' | 'contact' | 'tickets'
const DEPARTMENTS = [
  { value: 'SUPPORT', label: 'Suporte' }, { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'ADMINISTRATIVE', label: 'Administrativo' }, { value: 'FINANCIAL', label: 'Financeiro' },
]
const STATUS_LABELS: Record<string, string> = { NEW: 'Novo', IN_PROGRESS: 'Em andamento', ON_HOLD: 'Em espera', SOLVED: 'Resolvido' }

const HelpPage = () => {
  const { companyId } = useAuth()
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
  }, [companyId])

  const loadTickets = async () => {
    try { const r = await api.get('/helpdesk/tickets/my'); setTickets(r.data?.data || []) } catch { /* */ }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await api.post('/helpdesk/tickets', form)
      setShowModal(false); setForm({ subject: '', description: '', department: 'SUPPORT', priority: 'LOW' })
      loadTickets()
    } catch { /* ignore */ }
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
      setReplyText('')
      const r = await api.get(`/helpdesk/tickets/protocol/${selectedTicket.tickedId}`)
      setSelectedTicket(r.data || selectedTicket)
    } catch { /* ignore */ }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><h3><HelpCircle size={20} /> Ajuda</h3></div>
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
          <button className={`btn ${tab === 'faq' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('faq')}>FAQ</button>
          <button className={`btn ${tab === 'contact' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('contact')}><Phone size={14} /> Contato</button>
          <button className={`btn ${tab === 'tickets' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('tickets')}><FileText size={14} /> Chamados</button>
        </div>
      </div>

      {tab === 'faq' && (
        <div className="card">
          {faqs.length === 0 ? <div className="empty-table">Nenhuma pergunta disponível</div> : (
            <div style={{ padding: '16px' }}>
              {faqs.map(f => (
                <div key={f._id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                  <button style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setExpandedFaq(expandedFaq === f._id ? null : f._id)}>
                    <strong>{f.title}</strong>
                    {expandedFaq === f._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expandedFaq === f._id && <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{f.caption && <p><em>{f.caption}</em></p>}<p>{f.description}</p></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'contact' && (
        <div className="card">
          <div style={{ padding: '16px' }}>
            {!contact ? <div className="empty-table">Carregando...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contact.supportEmail && <div><strong>Email:</strong> <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a></div>}
                {contact.supportPhone && <div><strong>Telefone:</strong> <a href={`tel:${contact.supportPhone}`}>{contact.supportPhone}</a></div>}
                {contact.whatsapp && <div><strong>WhatsApp:</strong> <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{contact.whatsapp}</a></div>}
                {contact.website && <div><strong>Site:</strong> <a href={contact.website} target="_blank" rel="noreferrer">{contact.website}</a></div>}
                {contact.supportHours && <div><strong>Horário:</strong> {contact.supportHours}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'tickets' && (
        <div className="card">
          <div className="card-header">
            <h3><FileText size={20} /> Meus Chamados</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Abrir Chamado</button>
          </div>
          <div className="table-wrapper">
            {tickets.length === 0 ? <div className="empty-table">Nenhum chamado</div> : (
              <table className="table">
                <thead><tr><th>Protocolo</th><th>Assunto</th><th>Status</th><th>Data</th></tr></thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => openTicket(t)}>
                      <td className="td-name"><strong>#{t.tickedId}</strong></td>
                      <td>{t.subject || 'Sem assunto'}</td>
                      <td><span className={`badge ${t.status === 'NEW' ? 'badge-warning' : t.status === 'SOLVED' ? 'badge-success' : 'badge-info'}`}>{STATUS_LABELS[t.status] || t.status}</span></td>
                      <td>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Abrir Chamado</h3><button className="close-btn" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleCreateTicket} style={{ padding: '16px' }}>
              <div className="form-group"><label>Assunto *</label><input className="form-input" type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
              <div className="form-group"><label>Descrição *</label><textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>Departamento</label><select className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>{DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
                <div className="form-group" style={{ flex: 1 }}><label>Prioridade</label><select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option></select></div>
              </div>
              <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>#{selectedTicket.tickedId}</h3><button className="close-btn" onClick={() => setSelectedTicket(null)}>✕</button></div>
            {ticketLoading ? <div className="loading"><div className="spinner-sm" /></div> : (
              <div style={{ padding: '16px' }}>
                <p><strong>{selectedTicket.subject}</strong></p>
                <span className={`badge ${selectedTicket.status === 'SOLVED' ? 'badge-success' : 'badge-info'}`}>{STATUS_LABELS[selectedTicket.status] || selectedTicket.status}</span>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                {(selectedTicket.interactions || []).map(inter => (
                  <div key={inter._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="badge badge-info">{inter.origin}</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(inter.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                    <p style={{ margin: '4px 0 0' }}>{inter.description}</p>
                  </div>
                ))}
                {selectedTicket.status !== 'SOLVED' && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea className="form-input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Sua resposta..." rows={3} style={{ width: '100%' }} />
                    <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={!replyText.trim()} style={{ marginTop: '8px' }}>Enviar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpPage
