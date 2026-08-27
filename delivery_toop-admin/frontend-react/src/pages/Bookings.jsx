import React, { useState, useEffect } from 'react';
import { CalendarCheck, MapPin, User, Car, Clock, XCircle, Eye } from 'lucide-react';
import { bookingService } from '../services/api';

const STATUS_MAP = {
  pending: 'Pendente',
  matching: 'Buscando',
  accepted: 'Aceita',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  matching: '#3b82f6',
  accepted: '#8b5cf6',
  in_progress: '#06b6d4',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const SERVICE_LABELS = {
  driver: 'Corrida',
  delivery: 'Entrega',
  package: 'Pacote',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await bookingService.getStats();
      setStats(result);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const result = await bookingService.getBookings();
      const data = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      setBookings(data);
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const handleCancelBooking = async (booking) => {
    const reason = prompt('Motivo do cancelamento:');
    if (reason === null) return;
    try {
      await bookingService.cancelBooking(booking._id, reason || 'Cancelado pelo administrador');
      loadBookings();
      setDetailOpen(false);
    } catch (error) {
      alert('Erro ao cancelar: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const statusCount = (status) => bookings.filter(b => b.status === status).length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <h4>{bookings.length}</h4>
            <p>Total Corridas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>{statusCount('in_progress') + statusCount('accepted')}</h4>
            <p>Em Andamento</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h4>{statusCount('completed')}</h4>
            <p>Concluídas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h4>R$ {totalRevenue.toFixed(2)}</h4>
            <p>Receita Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <span style={{ fontSize: 24 }}>⭐</span>
          </div>
          <div className="stat-info">
            <h4>{stats?.avgRating ? `${stats.avgRating}/5` : '—'}</h4>
            <p>Avaliação Média</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <h4>{stats?.completedToday ?? statusCount('completed')}</h4>
            <p>Concluídas Hoje</p>
          </div>
        </div>
      </div>

      {stats?.popularRoutes?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-header">
            <h3>Destinos Mais Populares</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 0.5rem 0.5rem' }}>
            {stats.popularRoutes.map((route, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontWeight: 700, color: '#667eea', minWidth: 20 }}>#{i + 1}</span>
                  <MapPin size={14} color="#ef4444" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.address}</span>
                </div>
                <span className="badge" style={{ flexShrink: 0 }}>{route.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Corridas</h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'matching', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'Todas' : STATUS_MAP[s]} ({s === 'all' ? bookings.length : statusCount(s)})
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma corrida encontrada</td></tr>
              ) : filteredBookings.map(booking => (
                <tr key={booking._id}>
                  <td><span style={{ fontWeight: 600 }}>#{booking.bookingNumber}</span></td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', backgroundColor: '#e8f4fd', color: '#3b82f6' }}>
                      {SERVICE_LABELS[booking.serviceCategory] || booking.serviceCategory}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} />
                      <span>{booking.client?.name || '-'}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <MapPin size={12} color="#10b981" /> {booking.pickup?.address}
                  </td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <MapPin size={12} color="#ef4444" /> {booking.dropoff?.address}
                  </td>
                  <td>
                    <strong>R$ {(booking.finalPrice || booking.estimatedPrice || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: '#fff',
                      backgroundColor: STATUS_COLORS[booking.status] || '#666',
                    }}>
                      {STATUS_MAP[booking.status] || booking.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleViewDetails(booking)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detailOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h3>Corrida #{selectedBooking.bookingNumber}</h3>
              <button className="close-btn" onClick={() => setDetailOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Tipo:</strong>{' '}
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', backgroundColor: '#e8f4fd', color: '#3b82f6' }}>
                    {SERVICE_LABELS[selectedBooking.serviceCategory]}
                  </span>
                </div>
                <div><strong>Status:</strong>{' '}
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#fff', backgroundColor: STATUS_COLORS[selectedBooking.status] }}>
                    {STATUS_MAP[selectedBooking.status]}
                  </span>
                </div>
                <div><strong>Cliente:</strong> {selectedBooking.client?.name || selectedBooking.client}</div>
                <div><strong>Motorista:</strong> {selectedBooking.driver?.name || 'Não atribuído'}</div>
                <div><strong>Distância:</strong> {selectedBooking.distance?.toFixed(2) || '-'} km</div>
                <div><strong>Preço Estimado:</strong> R$ {(selectedBooking.estimatedPrice || 0).toFixed(2)}</div>
                <div><strong>Pagamento:</strong> {selectedBooking.paymentMethod} ({selectedBooking.paymentStatus})</div>
                <div><strong>Criado em:</strong> {new Date(selectedBooking.createdAt).toLocaleString('pt-BR')}</div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#10b981' }}>📍 Origem:</strong>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginTop: '0.25rem' }}>
                      {selectedBooking.pickup?.address}
                      {selectedBooking.pickup?.complement && <div style={{ fontSize: '0.8rem', color: '#888' }}>{selectedBooking.pickup.complement}</div>}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#ef4444' }}>📍 Destino:</strong>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginTop: '0.25rem' }}>
                      {selectedBooking.dropoff?.address}
                      {selectedBooking.dropoff?.complement && <div style={{ fontSize: '0.8rem', color: '#888' }}>{selectedBooking.dropoff.complement}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.rating && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <strong>Avaliações:</strong>
                  {selectedBooking.rating.client && <div>Cliente: ⭐ {selectedBooking.rating.client}/5 {selectedBooking.rating.clientComment && `- "${selectedBooking.rating.clientComment}"`}</div>}
                  {selectedBooking.rating.driver && <div>Motorista: ⭐ {selectedBooking.rating.driver}/5 {selectedBooking.rating.driverComment && `- "${selectedBooking.rating.driverComment}"`}</div>}
                </div>
              )}

              {selectedBooking.notes && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <strong>Notas:</strong> {selectedBooking.notes}
                </div>
              )}

              {selectedBooking.cancelReason && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <strong style={{ color: '#ef4444' }}>Motivo Cancelamento:</strong> {selectedBooking.cancelReason}
                  {selectedBooking.cancelledBy && <span style={{ fontSize: '0.8rem', color: '#888' }}> (por {selectedBooking.cancelledBy})</span>}
                </div>
              )}

              {!['completed', 'cancelled'].includes(selectedBooking.status) && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <button className="btn btn-danger" onClick={() => handleCancelBooking(selectedBooking)}>
                    <XCircle size={14} /> Cancelar Corrida
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
