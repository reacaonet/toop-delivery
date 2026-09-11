import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

interface Notification {
  _id: string; title: string; message: string; type: string; read: boolean; createdAt: string
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async (p = 1) => {
    try {
      const res = await api.get('/notifications/my', { params: { role: 'deliveryman', page: p, limit: '20' } })
      const result = res.data
      setNotifications(result?.data || [])
      setTotalPages(result?.pages || 1)
      setPage(result?.page || 1)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  const markRead = async (id: string) => {
    try { await api.put(`/notifications/my/${id}/read`); setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n)) } catch { /* */ }
  }

  const markAllRead = async () => {
    try { await api.put('/notifications/my/read-all', { role: 'deliveryman' }); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) } catch { /* */ }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="earnings-page">
      <div className="earnings-header">
        <button className="btn-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1>Notificações</h1>
        {unreadCount > 0 && <button className="btn btn-sm btn-outline" onClick={markAllRead}>Marcar lidas</button>}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">Nenhuma notificação</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div key={n._id} className="stat-card" style={{ cursor: 'pointer', borderLeft: n.read ? '4px solid transparent' : `4px solid var(--${n.type === 'error' ? 'danger' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'})` }} onClick={() => markRead(n._id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{n.title}</strong>
                {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />}
              </div>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{n.message}</p>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
