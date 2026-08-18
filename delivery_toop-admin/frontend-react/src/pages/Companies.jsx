import React, { useState, useEffect } from 'react';
import { Plus, Building2, Phone, MapPin } from 'lucide-react';
import { companyService } from '../services/api';
import DataTable from '../components/DataTable';
import CompanyModal from '../components/CompanyModal';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setModalOpen(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return;
    }

    try {
      await companyService.deleteCompany(company._id);
      loadCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa');
    }
  };

  const handleSave = (savedCompany) => {
    loadCompanies();
  };

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={16} color="#667eea" />
          {name}
        </div>
      )
    },
    {
      key: 'address',
      title: 'Endereço',
      render: (address) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={14} color="#9ca3af" />
          {typeof address === 'object' && address !== null
            ? [address.street, address.number, address.neighborhood, address.city, address.state].filter(Boolean).join(', ')
            : address || 'N/A'}
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
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span className={`status-badge ${status ? 'status-active' : 'status-inactive'}`}>
          {status ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Empresas</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Nova Empresa
          </button>
        </div>

        <DataTable
          data={companies}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          emptyMessage="Nenhuma empresa encontrada"
        />
      </div>

      <CompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        company={selectedCompany}
        onSave={handleSave}
      />
    </div>
  );
};

export default Companies;
