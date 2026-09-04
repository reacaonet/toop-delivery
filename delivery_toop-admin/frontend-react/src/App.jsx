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
import Drivers from './pages/Drivers';
import Bookings from './pages/Bookings';
import Promos from './pages/Promos';
import Coupons from './pages/Coupons';
import WalletPage from './pages/Wallet';
import Payments from './pages/Payments';
import Cashback from './pages/Cashback';
import Packings from './pages/Packings';
import Shoppers from './pages/Shoppers';
import Franchises from './pages/Franchises';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Products from './pages/Products';
import Painel from './pages/Painel';
import AccessControl from './pages/AccessControl';
import DomainSettings from './pages/DomainSettings';
import HelpDesk from './pages/HelpDesk';
import Email from './pages/Email';
import Marketing from './pages/Marketing';
import Log from './pages/Log';
import Vouchers from './pages/Vouchers';
import Mobility from './pages/Mobility';
import Monitor from './pages/Monitor';
import Supermarket from './pages/Supermarket';
import PreRegister from './pages/PreRegister';
import Accessories from './pages/Accessories';
import SearchScreen from './pages/Search';
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
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/cashback" element={<Cashback />} />
            <Route path="/packings" element={<Packings />} />
            <Route path="/shoppers" element={<Shoppers />} />
            <Route path="/franchises" element={<Franchises />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/acl" element={<AccessControl />} />
            <Route path="/domain-settings" element={<DomainSettings />} />
            <Route path="/helpdesk" element={<HelpDesk />} />
            <Route path="/email" element={<Email />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/log" element={<Log />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/mobility" element={<Mobility />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/supermarket" element={<Supermarket />} />
            <Route path="/pre-register" element={<PreRegister />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/products" element={<Products />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/wallet" element={<WalletPage />} />
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
