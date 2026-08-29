import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [freshUser, setFreshUser] = useState(null);

  useEffect(() => {
    refreshUser().then((data) => {
      if (data) setFreshUser(data);
    });
  }, [refreshUser]);

  const current = freshUser || user;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const lastLogin = formatDate(current?.lastLogin);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Meu Perfil</h3>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {/* Informações Pessoais */}
        <div>
          <h4 style={{ 
            color: '#1f2937', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={20} color="#667eea" />
            Informações Pessoais
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                {current?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  {current?.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {current?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={16} color="#9ca3af" />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#1f2937' }}>
                {current?.email}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar size={16} color="#9ca3af" />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Último Acesso</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#1f2937' }}>
                {lastLogin || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Acesso */}
        <div>
          <h4 style={{ 
            color: '#1f2937', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Shield size={20} color="#667eea" />
            Informações de Acesso
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Tipo de Usuário
              </div>
              <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>
                {current?.role === 'admin' ? 'Administrador do Sistema' : 'Usuário Comum'}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Permissões
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {current?.role === 'admin' ? (
                  <>
                    <span className="status-badge status-active">Usuários</span>
                    <span className="status-badge status-active">Empresas</span>
                    <span className="status-badge status-active">Pedidos</span>
                    <span className="status-badge status-active">Entregadores</span>
                    <span className="status-badge status-active">Pagamentos</span>
                    <span className="status-badge status-active">Configurações</span>
                  </>
                ) : (
                  <>
                    <span className="status-badge status-active">Visualizar</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Status da Conta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981'
                }} />
                <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>
                  Conta Ativa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
