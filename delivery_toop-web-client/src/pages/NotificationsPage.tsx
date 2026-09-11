import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  target: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async (p = 1) => {
    try {
      const { data: res } = await api.get('/notifications/my', { params: { role: 'customer', page: p, limit: '20' } })
      const result = res.data
      setNotifications(result.data || [])
      setTotalPages(result.pages || 1)
      setPage(result.page || 1)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/my/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/my/read-all', { role: 'customer' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      showToast('Todas marcadas como lidas')
    } catch { showToast('Erro ao marcar notificações', 'error') }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Voltar</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="page-title">Notificações</h1>
        {unreadCount > 0 && (
          <button className="btn btn-sm btn-outline" onClick={markAllRead}>Marcar todas como lidas</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <p>Nenhuma notificação</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`notification-item ${n.read ? '' : 'unread'} notification-${n.type}`}
              onClick={() => markRead(n._id)}
            >
              <div className="notification-header">
                <strong>{n.title}</strong>
                {!n.read && <span className="notification-dot" />}
              </div>
              <p className="notification-message">{n.message}</p>
              <span className="notification-date">
                {new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && <button className="btn btn-sm btn-outline" onClick={() => load(page - 1)}>Anterior</button>}
              {page < totalPages && <button className="btn btn-sm btn-outline" onClick={() => load(page + 1)}>Próxima</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
