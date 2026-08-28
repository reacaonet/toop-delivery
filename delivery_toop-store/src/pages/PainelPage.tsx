import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Clock, CheckCircle, XCircle, Package, MapPin, Phone, User, LogOut, Truck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Novo Pedido',
  confirmed: 'Aceito',
  preparing: 'Em Preparação',
  ready: 'Pronto',
  delivering: 'A Caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#3b82f6',
  confirmed: '#6366f1',
  preparing: '#f59e0b',
  ready: '#f97316',
  delivering: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

const PAYMENT_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  money: 'Dinheiro',
  pix: 'PIX',
  CARD: 'Cartão',
  MONEY: 'Dinheiro',
  PIX: 'PIX',
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { currency: 'BRL', minimumFractionDigits: 2, style: 'currency' }).format(v || 0)

const formatTime = (d: string) => {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h${m % 60}min`
}

interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  customer?: { name?: string; email?: string }
  company?: { name?: string }
  deliveryman?: { name?: string }
  deliveryAddress?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount?: number
  total: number
  paymentMethod?: string
  paymentStatus?: string
  notes?: string
  createdAt: string
}

interface Deliveryman {
  _id: string
  name: string
  vehicleType?: string
  vehiclePlate?: string
  avatar?: string
  active: boolean
  documentStatus?: { cnh: string; vehicleDocument: string; photo: string }
}

export default function PainelPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [tab, setTab] = useState<'ongoing' | 'ended'>('ongoing')
  const [updating, setUpdating] = useState(false)
  const [deliverymen, setDeliverymen] = useState<Deliveryman[]>([])
  const [loadingDm, setLoadingDm] = useState(false)
  const [showDmModal, setShowDmModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const { user, companyId, logout } = useAuth()

  const loadOrders = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await api.get('/orders', { params: { company: companyId, limit: 200 } })
      const list = data?.data ?? data
      setOrders(Array.isArray(list) ? list : list?.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const loadDetail = useCallback(async (id: string) => {
    if (!id) { setSelected(null); return }
    setLoadingDetail(true)
    try {
      const { data } = await api.get(`/orders/${id}`)
      setSelected(data?.data ?? data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])
  useEffect(() => { const i = setInterval(loadOrders, 30000); return () => clearInterval(i) }, [loadOrders])
  useEffect(() => { if (selectedId) loadDetail(selectedId) }, [selectedId, loadDetail])

  const loadDeliverymen = useCallback(async () => {
    setLoadingDm(true)
    try {
      const { data } = await api.get('/deliverymen')
      const list = data?.data ?? data
      const arr: Deliveryman[] = Array.isArray(list) ? list : list?.data ?? []
      setDeliverymen(arr.filter(d => d.active && d.documentStatus?.cnh === 'approved' && d.documentStatus?.vehicleDocument === 'approved' && d.documentStatus?.photo === 'approved'))
    } catch { /* ignore */ }
    setLoadingDm(false)
  }, [])

  useEffect(() => { if (showDmModal) loadDeliverymen() }, [showDmModal, loadDeliverymen])

  const changeStatus = async (id: string, status: string, deliverymanId?: string) => {
    setUpdating(true)
    try {
      await api.put(`/orders/${id}/status`, { status, deliverymanId })
      await loadOrders()
      await loadDetail(id)
    } catch {
      alert('Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  const cancelOrder = async (id: string) => {
    if (!window.confirm('Cancelar este pedido?')) return
    setUpdating(true)
    try {
      await api.put(`/orders/${id}/status`, { status: 'cancelled' })
      await loadOrders()
      setSelectedId(null)
      setSelected(null)
    } catch {
      alert('Erro ao cancelar')
    } finally {
      setUpdating(false)
    }
  }

  const handleEnviarEntrega = (id: string) => {
    setPendingOrderId(id)
    setShowDmModal(true)
  }

  const handleConfirmarEntrega = (dmId: string) => {
    setShowDmModal(false)
    if (pendingOrderId) changeStatus(pendingOrderId, 'delivering', dmId)
    setPendingOrderId(null)
  }

  const ongoing = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered')
  const ended = orders.filter(o => o.status === 'cancelled' || o.status === 'delivered')
  const list = tab === 'ongoing' ? ongoing : ended

  const renderActions = () => {
    if (!selected || selected.status === 'cancelled' || selected.status === 'delivered') return null
    const id = selected._id
    const s = selected.status
    const btn = (cls: string, label: string, icon: JSX.Element, onClick: () => void) => (
      <button key={label} className={`pm-btn ${cls}`} disabled={updating} onClick={onClick}>
        {icon} {label}
      </button>
    )
    const icons = {
      check: <CheckCircle size={16} />,
      package: <Package size={16} />,
      x: <XCircle size={16} />,
    }

    const actions: JSX.Element[] = []
    if (s === 'pending') actions.push(btn('pm-green', 'Aceitar', icons.check, () => changeStatus(id, 'confirmed')))
    if (s === 'confirmed') actions.push(btn('pm-orange', 'Iniciar Preparação', icons.package, () => changeStatus(id, 'preparing')))
    if (s === 'preparing') actions.push(btn('pm-yellow', 'Marcar Pronto', icons.check, () => changeStatus(id, 'ready')))
    if (s === 'ready') {
      actions.push(btn('pm-blue', 'Atribuir Entregador', icons.package, () => handleEnviarEntrega(id)))
    }
    if (s === 'delivering') actions.push(btn('pm-green', 'Finalizar', icons.check, () => changeStatus(id, 'delivered')))
    if (s !== 'pending') actions.push(btn('pm-red', 'Cancelar', icons.x, () => cancelOrder(id)))

    return <div className="pm-actions">{actions}</div>
  }

  if (loading) return <div className="pm-loading"><div className="spinner" /></div>

  return (
    <div className="pm-root">
      <header className="pm-topbar">
        <div className="pm-topbar-left">
          <h1>GoJá Delivery</h1>
          <span className="pm-topbar-sub">Painel de Pedidos</span>
        </div>
        <div className="pm-topbar-right">
          <span className="pm-topbar-user">{user?.email}</span>
          <button className="pm-topbar-logout" onClick={logout}><LogOut size={18} /></button>
        </div>
      </header>

      <div className="pm-toolbar">
        <div className="pm-tabs">
          <button className={`pm-tab ${tab === 'ongoing' ? 'active' : ''}`}
            onClick={() => { setTab('ongoing'); setSelectedId(null); setSelected(null) }}>
            Em Andamento ({ongoing.length})
          </button>
          <button className={`pm-tab ${tab === 'ended' ? 'active' : ''}`}
            onClick={() => { setTab('ended'); setSelectedId(null); setSelected(null) }}>
            Finalizados ({ended.length})
          </button>
        </div>
        <button className="pm-refresh" onClick={loadOrders}><RefreshCw size={16} /> Atualizar</button>
      </div>

      <div className="pm-body">
        <div className="pm-cards">
          {list.length === 0 && <div className="pm-empty">Nenhum pedido</div>}
          {list.map(o => (
            <div key={o._id} className={`pm-card ${selectedId === o._id ? 'sel' : ''}`}
              onClick={() => setSelectedId(o._id)}>
              <div className="pm-card-top">
                <span className="pm-card-name">{o.customer?.name || 'Cliente'}</span>
                <span className="pm-card-time"><Clock size={11} /> {formatTime(o.createdAt)}</span>
              </div>
              <div className="pm-card-bot">
                <span className="pm-badge" style={{ background: STATUS_COLORS[o.status] }}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
                {o.status === 'ready' && !o.deliveryman && (
                  <span className="pm-badge" style={{ background: '#f59e0b', fontSize: 10, marginLeft: 4 }}>
                    Aguardando Entregador
                  </span>
                )}
                <span className="pm-card-total">{formatCurrency(o.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pm-detail">
          {!selected ? (
            <div className="pm-detail-empty"><Package size={48} color="#d1d5db" /><p>Selecione um pedido</p></div>
          ) : loadingDetail ? (
            <div className="pm-loading"><div className="spinner" /></div>
          ) : (
            <>
              <div className="pm-detail-head">
                <h2>Pedido #{selected.orderNumber}</h2>
                <span className="pm-badge lg" style={{ background: STATUS_COLORS[selected.status] }}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>

              <div className="pm-grid">
                <div className="pm-section">
                  <h4><User size={13} /> Cliente</h4>
                  <p>{selected.customer?.name || 'N/A'}</p>
                </div>
                <div className="pm-section">
                  <h4><MapPin size={13} /> Endereço</h4>
                  {selected.deliveryAddress ? (
                    <p>{selected.deliveryAddress.street}{selected.deliveryAddress.number ? `, ${selected.deliveryAddress.number}` : ''}{selected.deliveryAddress.neighborhood ? ` - ${selected.deliveryAddress.neighborhood}` : ''}{selected.deliveryAddress.city ? ` - ${selected.deliveryAddress.city}` : ''}</p>
                  ) : <p className="pm-sub">Não informado</p>}
                </div>
                <div className="pm-section">
                  <h4>Pagamento</h4>
                  <p>{PAYMENT_LABELS[selected.paymentMethod || ''] || selected.paymentMethod || 'N/A'}</p>
                  <p className="pm-sub">Status: {selected.paymentStatus || 'N/A'}</p>
                </div>
              </div>

              <div className="pm-section" style={{ marginTop: '1rem' }}>
                <h4>Itens</h4>
                <div className="pm-items">
                  {selected.items?.map((it, i) => (
                    <div key={i} className="pm-item">
                      <span className="pm-item-name">{it.name}</span>
                      <span className="pm-item-qty">x{it.quantity}</span>
                      <span className="pm-item-price">{formatCurrency(it.total || it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pm-totals">
                <div className="pm-total-row"><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
                <div className="pm-total-row"><span>Entrega</span><span>{formatCurrency(selected.deliveryFee)}</span></div>
                {(selected.discount ?? 0) > 0 && <div className="pm-total-row"><span>Desconto</span><span>-{formatCurrency(selected.discount!)}</span></div>}
                <div className="pm-total-row tot"><span>Total</span><span>{formatCurrency(selected.total)}</span></div>
              </div>

              {selected.notes && <div className="pm-section" style={{ marginTop: '0.75rem' }}><h4>Obs</h4><p>{selected.notes}</p></div>}

              {renderActions()}
            </>
          )}
        </div>
      </div>

      {showDmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setShowDmModal(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, maxHeight: '80vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={20} /> Selecionar Entregador
            </h3>
            {loadingDm ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Carregando...</p>
            ) : deliverymen.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Nenhum entregador disponível</p>
            ) : (
              deliverymen.map(dm => (
                <div key={dm._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  onClick={() => handleConfirmarEntrega(dm._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {dm.avatar ? (
                      <img src={dm.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#9ca3af" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{dm.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{dm.vehicleType} {dm.vehiclePlate ? `- ${dm.vehiclePlate}` : ''}</div>
                    </div>
                  </div>
                  <CheckCircle size={20} color="#10b981" />
                </div>
              ))
            )}
            <button className="pm-btn pm-red" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowDmModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
