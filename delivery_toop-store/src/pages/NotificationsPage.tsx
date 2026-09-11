import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

interface Notification {
  _id: string; title: string; message: string; type: string; read: boolean; createdAt: string
}

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async (p = 1) => {
    try {
      const res = await api.get('/notifications/my', { params: { role: 'store', page: p, limit: '20' } })
      const result = res.data
      setNotifications(result?.data || [])
      setTotalPages(result?.pages || 1)
      setPage(result?.page || 1)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/my/read-all', { role: 'store' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { /* ignore */ }
  }

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/my/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch { /* ignore */ }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Bell size={20} /> Notificações {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}</h3>
          {unreadCount > 0 && <button className="btn btn-sm btn-outline" onClick={markAllRead}><CheckCheck size={14} /> Marcar todas lidas</button>}
        </div>
        <div className="table-wrapper">
          {notifications.length === 0 ? (
            <div className="empty-table">Nenhuma notificação</div>
          ) : (
            <div className="notifications-list">
              {notifications.map(n => (
                <div key={n._id} className={`notification-item ${n.read ? '' : 'unread'} notification-${n.type}`} onClick={() => markRead(n._id)}>
                  <div className="notification-header">
                    <strong>{n.title}</strong>
                    {!n.read && <span className="notification-dot" />}
                  </div>
                  <p className="notification-message">{n.message}</p>
                  <span className="notification-date">{new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="form-actions">
              {page > 1 && <button className="btn btn-sm btn-outline" onClick={() => load(page - 1)}>Anterior</button>}
              {page < totalPages && <button className="btn btn-sm btn-outline" onClick={() => load(page + 1)}>Próxima</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
