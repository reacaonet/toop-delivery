import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Companies from './pages/Companies';
import Categories from './pages/Categories';
import Banners from './pages/Banners';
import Orders from './pages/Orders';
import Deliverymen from './pages/Deliverymen';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function AdminLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/deliverymen" element={<Deliverymen />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
