import React, { useState, useEffect } from 'react';
import { Plus, Car, Phone, Mail, Edit2, Trash2, Eye, CheckCircle, XCircle, Star, MapPin, Truck } from 'lucide-react';
import { driverService, deliverymanService } from '../services/api';

const VEHICLE_LABELS = {
  motorcycle: 'Moto',
  bike: 'Bicicleta',
  car: 'Carro',
  van: 'Van',
};

const SERVICE_LABELS = {
  driver: 'Corridas',
  delivery: 'Entregas',
  package: 'Pacotes',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    serviceCategories: ['driver'],
    password: '',
    active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const [driverResult, dmResult] = await Promise.all([
        driverService.getDrivers(),
        deliverymanService.getDeliverymen()
      ]);
      const driverData = Array.isArray(driverResult?.data) ? driverResult.data : Array.isArray(driverResult) ? driverResult : [];
      const dmData = Array.isArray(dmResult?.data) ? dmResult.data : Array.isArray(dmResult) ? dmResult : [];
      const hybridDrivers = dmData.filter(d => d.isDriver).map(d => ({
        ...d,
        _source: 'deliveryman',
        online: d.driverOnline,
        available: d.driverAvailable,
        serviceCategories: d.serviceCategories || ['driver'],
      }));
      const allDrivers = [...driverData.map(d => ({ ...d, _source: 'driver' })), ...hybridDrivers];
      setDrivers(allDrivers);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      serviceCategories: ['driver'],
      password: '',
      active: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (driver) => {
    setSelected(driver);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      cpf: driver.cpf || '',
      vehicleType: driver.vehicleType || 'motorcycle',
      vehiclePlate: driver.vehiclePlate || '',
      serviceCategories: driver.serviceCategories || ['driver'],
      password: '',
      active: driver.active !== false,
    });
    setModalOpen(true);
  };

  const handleViewDetails = (driver) => {
    setSelected(driver);
    setDetailOpen(true);
  };

  const handleToggleActive = async (driver) => {
    try {
      if (driver._source === 'deliveryman') {
        await deliverymanService.updateDeliveryman(driver._id, { active: !driver.active });
      } else {
        await driverService.updateDriver(driver._id, { active: !driver.active });
      }
      loadDrivers();
    } catch (error) {
      alert('Erro ao alterar status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`Desativar motorista ${driver.name}?`)) return;
    try {
      if (driver._source === 'deliveryman') {
        await deliverymanService.deleteDeliveryman(driver._id);
      } else {
        await driverService.deleteDriver(driver._id);
      }
      loadDrivers();
    } catch (error) {
      alert('Erro ao desativar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selected) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        if (selected._source === 'deliveryman') {
          await deliverymanService.updateDeliveryman(selected._id, payload);
        } else {
          await driverService.updateDriver(selected._id, payload);
        }
      } else {
        await driverService.createDriver(formData);
      }
      setModalOpen(false);
      loadDrivers();
    } catch (error) {
      alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleServiceCategoryToggle = (cat) => {
    setFormData(prev => {
      const cats = prev.serviceCategories || [];
      if (cats.includes(cat)) {
        return { ...prev, serviceCategories: cats.filter(c => c !== cat) };
      } else {
        return { ...prev, serviceCategories: [...cats, cat] };
      }
    });
  };

  const onlineCount = drivers.filter(d => d.online).length;
  const availableCount = drivers.filter(d => d.available).length;
  const activeCount = drivers.filter(d => d.active).length;
  const avgRating = drivers.length > 0
    ? (drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length).toFixed(1)
    : '0.0';

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h4>{drivers.length}</h4>
            <p>Total Motoristas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>{activeCount}</h4>
            <p>Ativos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h4>{availableCount}</h4>
            <p>Disponíveis</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h4>{avgRating}</h4>
            <p>Avaliação Média</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Motoristas</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} /> Novo Motorista
          </button>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Veículo</th>
                <th>Serviços</th>
                <th>Status</th>
                <th>Avaliação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum motorista encontrado</td></tr>
              ) : drivers.map(driver => (
                <tr key={driver._id} style={{ opacity: driver.active === false ? 0.5 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: driver._source === 'deliveryman' ? '#10b981' : '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                        {driver._source === 'deliveryman' ? <Truck size={14} /> : <Car size={14} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{driver.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>
                          {driver._source === 'deliveryman' ? '🚚 Entregador + Motorista' : '🚗 Motorista'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.85rem' }}><Mail size={12} /> {driver.email}</span>
                      <span style={{ fontSize: '0.85rem' }}><Phone size={12} /> {driver.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span>{VEHICLE_LABELS[driver.vehicleType] || driver.vehicleType}</span>
                    {driver.vehiclePlate && <div style={{ fontSize: '0.75rem', color: '#888' }}>{driver.vehiclePlate}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(driver.serviceCategories || []).map(cat => (
                        <span key={cat} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', backgroundColor: '#e8f4fd', color: '#3b82f6' }}>
                          {SERVICE_LABELS[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={`status-badge ${driver.active ? 'status-active' : 'status-inactive'}`}>
                        {driver.active ? 'Ativo' : 'Inativo'}
                      </span>
                      {driver.online && (
                        <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Online</span>
                      )}
                      {driver._source === 'deliveryman' && driver.driverOnline && (
                        <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>● Motorista Online</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" /> {driver.rating?.toFixed(1) || '5.0'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleViewDetails(driver)}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEdit(driver)}>
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`btn ${driver.active ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleToggleActive(driver)}
                      >
                        {driver.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Motorista' : 'Novo Motorista'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo de Veículo</label>
                  <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                    <option value="motorcycle">Moto</option>
                    <option value="car">Carro</option>
                    <option value="bike">Bicicleta</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Placa</label>
                  <input type="text" value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Categorias de Serviço</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['driver', 'delivery', 'package'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleServiceCategoryToggle(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: `2px solid ${formData.serviceCategories?.includes(cat) ? '#667eea' : '#ddd'}`,
                        backgroundColor: formData.serviceCategories?.includes(cat) ? '#667eea' : '#fff',
                        color: formData.serviceCategories?.includes(cat) ? '#fff' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {SERVICE_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
              {!selected && (
                <div className="form-group">
                  <label>Senha</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="motorista123" />
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOpen && selected && (
        <div className="modal-overlay" onClick={() => setDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Detalhes do Motorista</h3>
              <button className="close-btn" onClick={() => setDetailOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><strong>Nome:</strong> {selected.name}</div>
                <div><strong>Email:</strong> {selected.email}</div>
                <div><strong>Telefone:</strong> {selected.phone}</div>
                <div><strong>CPF:</strong> {selected.cpf || '-'}</div>
                <div><strong>Veículo:</strong> {VEHICLE_LABELS[selected.vehicleType]} {selected.vehiclePlate && `(${selected.vehiclePlate})`}</div>
                <div><strong>Serviços:</strong> {(selected.serviceCategories || []).map(c => SERVICE_LABELS[c]).join(', ')}</div>
                <div><strong>Avaliação:</strong> ⭐ {selected.rating?.toFixed(1) || '5.0'}</div>
                <div><strong>Total Viagens:</strong> {selected.totalTrips || 0}</div>
                <div><strong>Status:</strong> <span className={`status-badge ${selected.active ? 'status-active' : 'status-inactive'}`}>{selected.active ? 'Ativo' : 'Inativo'}</span></div>
                <div><strong>Online:</strong> {selected.online ? '🟢 Sim' : '🔴 Não'}</div>
                <div><strong>Disponível:</strong> {selected.available ? '✅ Sim' : '❌ Não'}</div>
              </div>
              {selected.documentStatus && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <strong>Documentos:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {['cnh', 'vehicleDocument', 'photo'].map(doc => (
                      <div key={doc} style={{ padding: '8px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                          {doc === 'cnh' ? 'CNH' : doc === 'vehicleDocument' ? 'Documento Veículo' : 'Foto'}
                        </span>
                        <span style={{ color: STATUS_COLORS[selected.documentStatus[doc]], fontWeight: 600 }}>
                          {selected.documentStatus[doc] === 'pending' ? '⏳ Pendente' :
                           selected.documentStatus[doc] === 'approved' ? '✅ Aprovado' : '❌ Rejeitado'}
                        </span>
                        {selected.documentStatus[doc] === 'pending' && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                              onClick={async () => {
                                try {
                                  const updateData = { documentStatus: { ...selected.documentStatus, [doc]: 'approved' } };
                                  if (selected._source === 'deliveryman') {
                                    await deliverymanService.updateDeliveryman(selected._id, updateData);
                                  } else {
                                    await driverService.updateDriver(selected._id, updateData);
                                  }
                                  setSelected({ ...selected, documentStatus: { ...selected.documentStatus, [doc]: 'approved' } });
                                  loadDrivers();
                                } catch (err) {
                                  alert('Erro: ' + (err.response?.data?.error || err.message));
                                }
                              }}
                            >Aprovar</button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                              onClick={async () => {
                                try {
                                  const updateData = { documentStatus: { ...selected.documentStatus, [doc]: 'rejected' } };
                                  if (selected._source === 'deliveryman') {
                                    await deliverymanService.updateDeliveryman(selected._id, updateData);
                                  } else {
                                    await driverService.updateDriver(selected._id, updateData);
                                  }
                                  setSelected({ ...selected, documentStatus: { ...selected.documentStatus, [doc]: 'rejected' } });
                                  loadDrivers();
                                } catch (err) {
                                  alert('Erro: ' + (err.response?.data?.error || err.message));
                                }
                              }}
                            >Rejeitar</button>
                          </div>
                        )}
                        {selected.documentStatus[doc] === 'rejected' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '2px 8px', fontSize: '0.7rem', marginTop: '4px' }}
                            onClick={async () => {
                              try {
                                const updateData = { documentStatus: { ...selected.documentStatus, [doc]: 'pending' } };
                                if (selected._source === 'deliveryman') {
                                  await deliverymanService.updateDeliveryman(selected._id, updateData);
                                } else {
                                  await driverService.updateDriver(selected._id, updateData);
                                }
                                setSelected({ ...selected, documentStatus: { ...selected.documentStatus, [doc]: 'pending' } });
                                loadDrivers();
                              } catch (err) {
                                alert('Erro: ' + (err.response?.data?.error || err.message));
                              }
                            }}
                          >Reenviar para revisão</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
