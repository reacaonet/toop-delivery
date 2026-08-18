import React, { useState, useEffect } from 'react';
import { Users, Building2, ShoppingCart, Truck, CreditCard, Bell } from 'lucide-react';
import { userService, companyService, orderService, deliverymanService, paymentService, notificationService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    orders: 0,
    deliverymen: 0,
    payments: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, companies, orders, deliverymen, payments, notifications] = await Promise.all([
        userService.getUsers(),
        companyService.getCompanies(),
        orderService.getOrders(),
        deliverymanService.getDeliverymen(),
        paymentService.getPayments(),
        notificationService.getNotifications()
      ]);

      setStats({
        users: users.length,
        companies: companies.length,
        orders: orders.length,
        deliverymen: deliverymen.length,
        payments: payments.length,
        notifications: notifications.length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { key: 'users', label: 'Usuários', icon: Users, color: '#3b82f6' },
    { key: 'companies', label: 'Empresas', icon: Building2, color: '#10b981' },
    { key: 'orders', label: 'Pedidos', icon: ShoppingCart, color: '#f59e0b' },
    { key: 'deliverymen', label: 'Entregadores', icon: Truck, color: '#8b5cf6' },
    { key: 'payments', label: 'Pagamentos', icon: CreditCard, color: '#ef4444' },
    { key: 'notifications', label: 'Notificações', icon: Bell, color: '#06b6d4' }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="stat-card">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <h4>{stat.label}</h4>
                  <div className="value">{stats[stat.key]}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Bem-vindo ao Toop Delivery Admin</h3>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '1rem'
        }}>
          <div>
            <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Visão Geral</h4>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Sistema completo de gerenciamento para delivery. 
              Gerencie usuários, empresas, pedidos e muito mais.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Recursos</h4>
            <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
              <li>Gestão completa de usuários</li>
              <li>Controle de empresas e parceiros</li>
              <li>Acompanhamento de pedidos em tempo real</li>
              <li>Gestão de entregadores</li>
              <li>Relatórios de pagamentos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
