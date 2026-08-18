import React, { useState, useEffect } from 'react';
import { Plus, Truck, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { deliverymanService } from '../services/api';
import DataTable from '../components/DataTable';

const Deliverymen = () => {
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'motorcycle',
    status: true
  });
  const [formLoading, setFormLoading] = useState(false);

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
    setSelectedDeliveryman(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      vehicleType: 'motorcycle',
      status: true
    });
    setModalOpen(true);
  };

  const handleEdit = (deliveryman) => {
    setSelectedDeliveryman(deliveryman);
    setFormData({
      name: deliveryman.name || '',
      email: deliveryman.email || '',
      phone: deliveryman.phone || '',
      vehicleType: deliveryman.vehicleType || 'Moto',
      status: deliveryman.status !== undefined ? deliveryman.status : true
    });
    setModalOpen(true);
  };

  const handleDelete = async (deliveryman) => {
    if (!window.confirm(`Tem certeza que deseja excluir o entregador "${deliveryman.name}"?`)) {
      return;
    }

    try {
      await deliverymanService.deleteDeliveryman(deliveryman._id);
      loadDeliverymen();
    } catch (error) {
      console.error('Erro ao excluir entregador:', error);
      alert('Erro ao excluir entregador');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedDeliveryman) {
        await deliverymanService.updateDeliveryman(selectedDeliveryman._id, formData);
      } else {
        await deliverymanService.createDeliveryman(formData);
      }

      setModalOpen(false);
      loadDeliverymen();
      alert(selectedDeliveryman ? 'Entregador atualizado com sucesso!' : 'Entregador criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar entregador:', error);
      alert('Erro ao salvar entregador: ' + (error.response?.data?.error || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle': return '🏍️';
      case 'bike': return '🚴';
      case 'car': return '🚗';
      case 'van': return '🚐';
      default: return '🚚';
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={16} color="#8b5cf6" />
          {name || 'N/A'}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={14} color="#9ca3af" />
          {email || 'N/A'}
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (phone) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={14} color="#9ca3af" />
          {phone || 'N/A'}
        </div>
      )
    },
    {
      key: 'vehicleType',
      title: 'Veículo',
      render: (vehicleType) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{getVehicleIcon(vehicleType)}</span>
          {vehicleType || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span className={`status-badge ${status ? 'status-active' : 'status-inactive'}`}>
          {status ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_, deliveryman) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleEdit(deliveryman)}
            style={{ padding: '0.5rem' }}
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(deliveryman)}
            style={{ padding: '0.5rem' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const stats = {
    total: deliverymen.length,
    active: deliverymen.filter(d => d.status).length,
    inactive: deliverymen.filter(d => !d.status).length,
  };

  return (
    <div>
      <div className="stats-grid">
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
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Entregadores</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Novo Entregador
          </button>
        </div>

        <DataTable
          data={deliverymen}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum entregador encontrado"
        />
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedDeliveryman ? 'Editar Entregador' : 'Novo Entregador'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  <Truck size={16} color="#8b5cf6" style={{ marginRight: '0.5rem' }} />
                  Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome do entregador"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={14} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={14} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="form-group">
                <label htmlFor="vehicleType">Tipo de Veículo</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                >
                  <option value="motorcycle">Moto</option>
                  <option value="bike">Bicicleta</option>
                  <option value="car">Carro</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                  />
                  Status Ativo
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliverymen;
