import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Companies from './pages/Companies';
import AppCategories from './pages/AppCategories';
import Banners from './pages/Banners';
import Deliverymen from './pages/Fleet';
import Bookings from './pages/Bookings';
import Promos from './pages/Promos';
import WalletPage from './pages/Wallet';
import Withdrawals from './pages/Withdrawals';
import Payments from './pages/Payments';
import Franchises from './pages/Franchises';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import AccessControl from './pages/AccessControl';
import HelpDesk from './pages/HelpDesk';
import Log from './pages/Log';
import Monitor from './pages/Monitor';
import MobilityServices from './pages/MobilityServices';
import MobilityEvaluations from './pages/MobilityEvaluations';
import MobilityReports from './pages/MobilityReports';
import MobilityMonitor from './pages/MobilityMonitor';
import MobilityExtract from './pages/MobilityExtract';
import MobilityDocuments from './pages/MobilityDocuments';
import Groups from './pages/Groups';
import AccessFlow from './pages/AccessFlow';
import MobilityDocumentTypes from './pages/MobilityDocumentTypes';
import MobilityPeakHours from './pages/MobilityPeakHours';
import MobilitySupportSubjects from './pages/MobilitySupportSubjects';
import Reviews from './pages/Reviews';
import MobilityQrCodes from './pages/MobilityQrCodes';
import RideCategories from './pages/RideCategories';
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
            <Route path="/app-categories" element={<AppCategories />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/users" element={<Users />} />
            <Route path="/deliverymen" element={<Deliverymen />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/franchises" element={<Franchises />} />
            <Route path="/acl" element={<AccessControl />} />
            <Route path="/helpdesk" element={<HelpDesk />} />
            <Route path="/log" element={<Log />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/mobility/services" element={<MobilityServices />} />
            <Route path="/mobility/evaluations" element={<MobilityEvaluations />} />
            <Route path="/mobility/reports" element={<MobilityReports />} />
            <Route path="/mobility/monitoring" element={<MobilityMonitor />} />
            <Route path="/mobility/extract" element={<MobilityExtract />} />
            <Route path="/mobility/documents" element={<MobilityDocuments />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/access-flow" element={<AccessFlow />} />
            <Route path="/mobility/document-types" element={<MobilityDocumentTypes />} />
            <Route path="/mobility/peak-hours" element={<MobilityPeakHours />} />
            <Route path="/mobility/support-subjects" element={<MobilitySupportSubjects />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/mobility/qr-codes" element={<MobilityQrCodes />} />
            <Route path="/mobility/ride-categories" element={<RideCategories />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/wallet/withdrawals" element={<Withdrawals />} />
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