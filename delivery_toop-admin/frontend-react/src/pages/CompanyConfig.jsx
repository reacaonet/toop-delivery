import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { companyService, franchiseService } from '../services/api';

const CompanyConfig = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [franchises, setFranchises] = useState([]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await companyService.getCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar empresas:', err);
      } finally {
        setCompaniesLoading(false);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setConfig(null);
      return;
    }

    const loadConfig = async () => {
      setLoading(true);
      setConfig(null);
      try {
        const data = await franchiseService.getConfig(selectedCompany);
        setConfig(data);
      } catch (err) {
        console.error('Erro ao carregar configuração:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [selectedCompany]);

  useEffect(() => {
    if (!config || !selectedCompany) {
      setFranchises([]);
      return;
    }

    const loadFranchises = async () => {
      try {
        const data = await franchiseService.listAll();
        setFranchises(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar franquias:', err);
      }
    };
    loadFranchises();
  }, [config, selectedCompany]);

  const selectedCompanyData = companies.find(
    (c) => c._id === selectedCompany || c.id === selectedCompany
  );

  const matchedFranchise =
    selectedCompanyData?.franchise
      ? franchises.find((f) => f._id === selectedCompanyData.franchise)
      : null;

  const hasFranchise = !!selectedCompanyData?.franchise;

  const renderConfig = () => {
    if (!selectedCompany) {
      return (
        <div className="alert alert-info">
          Selecione uma empresa para visualizar a configuração.
        </div>
      );
    }

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }} />
          Carregando configuração...
        </div>
      );
    }

    if (!config) return null;

    if (!hasFranchise) {
      return (
        <div className="alert alert-warning" style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
          padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Settings size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>
              Não configurada
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a16207', marginTop: '0.25rem' }}>
              Esta empresa não possui uma franquia vinculada.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card" style={{ margin: 0 }}>
        <div style={{ padding: '1rem' }}>
          {matchedFranchise?.name && (
            <div style={{
              fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem',
              paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb',
            }}>
              Franquia: <strong style={{ color: '#1f2937' }}>{matchedFranchise.name}</strong>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={20} style={{ color: '#6b7280' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>Gorjeta</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Funcionalidade de gorjeta para motoristas
                </div>
              </div>
            </div>
            <span
              className="badge"
              style={{
                backgroundColor: config.activateTip ? '#dcfce7' : '#fee2e2',
                color: config.activateTip ? '#166534' : '#991b1b',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {config.activateTip ? 'Ativa' : 'Desativada'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>
            <Settings size={20} style={{ marginRight: '0.5rem' }} />
            Configuração da Empresa
          </h3>
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
              Empresa
            </label>
            <select
              className="form-control"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={companiesLoading}
              style={{
                width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px',
                border: '1px solid #d1d5db', fontSize: '0.85rem', color: '#1f2937',
                backgroundColor: 'white',
              }}
            >
              <option value="">
                {companiesLoading ? 'Carregando empresas...' : 'Selecione uma empresa'}
              </option>
              {companies.map((company) => (
                <option key={company._id || company.id} value={company._id || company.id}>
                  {company.name || company.companyName || 'Sem nome'}
                </option>
              ))}
            </select>
          </div>

          {renderConfig()}
        </div>
      </div>
    </div>
  );
};

export default CompanyConfig;
