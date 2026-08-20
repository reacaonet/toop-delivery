import React, { useState, useEffect, useRef } from 'react';
import { Plus, Truck, Phone, Mail, Edit2, Trash2, Eye, CheckCircle, XCircle, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { deliverymanService } from '../services/api';

const VEHICLE_LABELS = {
  motorcycle: 'Moto',
  bike: 'Bicicleta',
  car: 'Carro',
  van: 'Van',
};

const VEHICLE_ICONS = {
  motorcycle: '🏍️',
  bike: '🚴',
  car: '🚗',
  van: '🚐',
};

const Deliverymen = () => {
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    password: '',
    active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [docReviewOpen, setDocReviewOpen] = useState(false);
  const [docReviewDm, setDocReviewDm] = useState(null);
  const [docReviewLoading, setDocReviewLoading] = useState(false);
  const pendingRef = useRef(null);

  useEffect(() => {
    loadDeliverymen();
  }, []);

  const loadDeliverymen = async () => {
    try {
      setLoading(true);
      const data = await deliverymanService.getDeliverymen();
      setDeliverymen(data || []);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
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
      cnh: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      password: '',
      active: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (dm) => {
    setSelected(dm);
    setFormData({
      name: dm.name || '',
      email: dm.email || '',
      phone: dm.phone || '',
      cpf: dm.cpf || '',
      cnh: dm.cnh || '',
      vehicleType: dm.vehicleType || 'motorcycle',
      vehiclePlate: dm.vehiclePlate || '',
      password: '',
      active: dm.active !== false,
    });
    setModalOpen(true);
  };

  const handleViewDetails = (dm) => {
    setSelected(dm);
    setDetailOpen(true);
  };

  const handleToggleActive = async (dm) => {
    try {
      await deliverymanService.updateDeliveryman(dm._id, { active: !dm.active });
      loadDeliverymen();
    } catch (error) {
      alert('Erro ao alterar status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (dm) => {
    if (!window.confirm(`Excluir entregador "${dm.name}"?`)) return;
    try {
      await deliverymanService.deleteDeliveryman(dm._id);
      loadDeliverymen();
    } catch (error) {
      alert('Erro ao excluir: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      if (selected) {
        await deliverymanService.updateDeliveryman(selected._id, payload);
      } else {
        await deliverymanService.createDeliveryman(payload);
      }
      setModalOpen(false);
      loadDeliverymen();
      alert(selected ? 'Entregador atualizado!' : 'Entregador criado!');
    } catch (error) {
      alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpenDocReview = (dm) => {
    setDocReviewDm(dm);
    setDocReviewOpen(true);
  };

  const handleDocStatus = async (docKey, status) => {
    setDocReviewLoading(true);
    try {
      const currentStatus = docReviewDm.documentStatus || {};
      await deliverymanService.updateDeliveryman(docReviewDm._id, {
        documentStatus: { ...currentStatus, [docKey]: status },
      });
      const updated = await deliverymanService.getDeliverymen();
      const list = Array.isArray(updated) ? updated : (updated?.data || []);
      const fresh = list.find((d) => d._id === docReviewDm._id);
      if (fresh) setDocReviewDm(fresh);
      await loadDeliverymen();
    } catch (error) {
      alert('Erro ao atualizar documento: ' + (error.response?.data?.error || error.message));
    } finally {
      setDocReviewLoading(false);
    }
  };

  const scrollToPending = () => {
    const el = document.getElementById('deliverymen-table');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getDocsStatus = (dm) => {
    const docs = dm.documents || {};
    const total = 3;
    const uploaded = [docs.cnh, docs.vehicleDocument, docs.photo].filter(Boolean).length;
    return { uploaded, total };
  };

  const getDocStatusBadge = (dm) => {
    const { uploaded, total } = getDocsStatus(dm);
    if (uploaded === total) {
      return { label: 'Completo', bg: '#dcfce7', color: '#166534' };
    }
    if (uploaded === 0) {
      return { label: 'Sem Docs', bg: '#fee2e2', color: '#991b1b' };
    }
    return { label: 'Pendente', bg: '#fef3c7', color: '#92400e' };
  };

  const stats = {
    total: deliverymen.length,
    active: deliverymen.filter((d) => d.active).length,
    inactive: deliverymen.filter((d) => !d.active).length,
    pendingDocs: deliverymen.filter((d) => {
      const s = getDocsStatus(d);
      return s.uploaded < s.total;
    }).length,
  };

  return (
    <div>
      {stats.pendingDocs > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 500 }}>
            <AlertTriangle size={20} />
            {stats.pendingDocs} entregador(es) com documentos pendentes de aprovacao
          </div>
          <button className="btn btn-secondary" onClick={scrollToPending} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            Ver pendentes
          </button>
        </div>
      )}

      <div className="stats-grid" ref={pendingRef}>
        <div className="stat-card">
          <h4>Total</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Ativos</h4>
          <div className="value" style={{ color: '#10b981' }}>{stats.active}</div>
        </div>
        <div className="stat-card">
          <h4>Inativos</h4>
          <div className="value" style={{ color: '#ef4444' }}>{stats.inactive}</div>
        </div>
        <div className="stat-card">
          <h4>Docs Pendentes</h4>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pendingDocs}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Entregadores</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Novo Entregador
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : deliverymen.length === 0 ? (
          <div className="empty-state">Nenhum entregador encontrado</div>
        ) : (
          <div className="table-wrapper" id="deliverymen-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Veiculo</th>
                  <th>Documentos</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {deliverymen.map((dm) => {
                  const docs = getDocsStatus(dm);
                  const docBadge = getDocStatusBadge(dm);
                  return (
                    <tr key={dm._id}>
                      <td><strong>{dm.name || '-'}</strong></td>
                      <td>{dm.email || '-'}</td>
                      <td>{dm.phone || '-'}</td>
                      <td>
                        <span>{VEHICLE_ICONS[dm.vehicleType] || '🚚'} {VEHICLE_LABELS[dm.vehicleType] || dm.vehicleType}</span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: docBadge.bg,
                          color: docBadge.color,
                        }}>
                          {docBadge.label}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${dm.active ? 'status-active' : 'status-inactive'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleActive(dm)}
                          title={dm.active ? 'Clique para desativar' : 'Clique para ativar'}
                        >
                          {dm.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Ver detalhes" onClick={() => handleViewDetails(dm)}>
                            <Eye size={16} />
                          </button>
                          {docs.uploaded < docs.total && (
                            <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Revisar Documentos" onClick={() => handleOpenDocReview(dm)}>
                              <FileText size={16} />
                            </button>
                          )}
                          <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Editar" onClick={() => handleEdit(dm)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.4rem' }} title="Excluir" onClick={() => handleDelete(dm)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Entregador' : 'Novo Entregador'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={!!selected} />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="(11) 99999-9999" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>CPF</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                </div>
                <div className="form-group">
                  <label>CNH</label>
                  <input type="text" name="cnh" value={formData.cnh} onChange={handleInputChange} placeholder="Numero da CNH" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Veiculo</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                    <option value="motorcycle">Moto</option>
                    <option value="bike">Bicicleta</option>
                    <option value="car">Carro</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Placa</label>
                  <input type="text" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleInputChange} placeholder="ABC-1234" />
                </div>
              </div>
              {!selected && (
                <div className="form-group">
                  <label>Senha *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Minimo 6 caracteres" />
                </div>
              )}
              {selected && (
                <div className="form-group">
                  <label>Nova Senha (deixe vazio para manter)</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Minimo 6 caracteres" />
                </div>
              )}
              <div className="form-group">
                <label>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                  Ativo
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOpen && selected && (
        <div className="modal-overlay" onClick={() => setDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Detalhes do Entregador</h3>
              <button className="close-btn" onClick={() => setDetailOpen(false)}>×</button>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                {selected.avatar ? (
                  <img src={selected.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={24} color="#9ca3af" />
                  </div>
                )}
                <div>
                  <h4 style={{ margin: 0 }}>{selected.name}</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{selected.email}</p>
                  <span className={`status-badge ${selected.active ? 'status-active' : 'status-inactive'}`}>
                    {selected.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div><strong>Telefone:</strong> {selected.phone || '-'}</div>
                <div><strong>CPF:</strong> {selected.cpf || '-'}</div>
                <div><strong>CNH:</strong> {selected.cnh || '-'}</div>
                <div><strong>Veiculo:</strong> {VEHICLE_ICONS[selected.vehicleType]} {VEHICLE_LABELS[selected.vehicleType] || selected.vehicleType}</div>
                <div><strong>Placa:</strong> {selected.vehiclePlate || '-'}</div>
                <div><strong>Avaliacao:</strong> {selected.rating ?? '-'}</div>
                <div><strong>Total entregas:</strong> {selected.totalDeliveries ?? 0}</div>
              </div>

              <h4 style={{ marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Documentos</h4>
              {(() => {
                const docs = selected.documents || {};
                const docList = [
                  { key: 'cnh', label: 'CNH', icon: FileText },
                  { key: 'vehicleDocument', label: 'Documento do Veiculo', icon: FileText },
                  { key: 'photo', label: 'Foto do Entregador', icon: ImageIcon },
                ];
                return docList.map(({ key, label, icon: Icon }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={16} color="#9ca3af" />
                      <span>{label}</span>
                    </div>
                    {docs[key] ? (
                      <a href={docs[key]} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        <Eye size={14} /> Ver
                      </a>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>Pendente</span>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {docReviewOpen && docReviewDm && (
        <div className="modal-overlay" onClick={() => setDocReviewOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Revisar Documentos</h3>
              <button className="close-btn" onClick={() => setDocReviewOpen(false)}>×</button>
            </div>
            <div>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem' }}>{docReviewDm.name}</h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{docReviewDm.email}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{docReviewDm.phone}</p>
                  </div>
                  <span className={`status-badge ${docReviewDm.active ? 'status-active' : 'status-inactive'}`}>
                    {docReviewDm.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {(() => {
                const docs = docReviewDm.documents || {};
                const status = docReviewDm.documentStatus || {};
                const docList = [
                  { key: 'cnh', label: 'CNH' },
                  { key: 'vehicleDocument', label: 'Documento do Veiculo' },
                  { key: 'photo', label: 'Foto do Entregador' },
                ];
                return docList.map(({ key, label }) => {
                  const docStatus = status[key] || 'pending';
                  const statusColors = {
                    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
                    approved: { bg: '#dcfce7', color: '#166534', label: 'Aprovado' },
                    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejeitado' },
                  };
                  const sc = statusColors[docStatus];
                  return (
                    <div key={key} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="#6b7280" />
                          <strong style={{ fontSize: '0.9rem' }}>{label}</strong>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: sc.bg,
                            color: sc.color,
                          }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>
                      {docs[key] ? (
                        <a href={docs[key]} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '0.5rem' }}>
                          <img
                            src={docs[key]}
                            alt={label}
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: '0.5rem',
                              border: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb',
                            }}
                          />
                        </a>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.5rem',
                          border: '1px dashed #d1d5db',
                          color: '#9ca3af',
                          fontSize: '0.85rem',
                          marginBottom: '0.5rem',
                        }}>
                          Nao enviado
                        </div>
                      )}
                      {docs[key] && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            disabled={docReviewLoading || docStatus === 'approved'}
                            onClick={() => handleDocStatus(key, 'approved')}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              padding: '0.4rem',
                              ...(docStatus === 'approved' ? { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' } : {}),
                            }}
                          >
                            <CheckCircle size={14} />
                            Aprovar
                          </button>
                          <button
                            className="btn btn-secondary"
                            disabled={docReviewLoading || docStatus === 'rejected'}
                            onClick={() => handleDocStatus(key, 'rejected')}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              padding: '0.4rem',
                              ...(docStatus === 'rejected' ? { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' } : {}),
                            }}
                          >
                            <XCircle size={14} />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliverymen;
