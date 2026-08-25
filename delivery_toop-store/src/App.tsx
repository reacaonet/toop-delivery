import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import PainelPage from './pages/PainelPage'
import ReportsPage from './pages/ReportsPage'
import StockPage from './pages/StockPage'
import StockItemsPage from './pages/StockItemsPage'
import StockBatchesPage from './pages/StockBatchesPage'
import StockMovementsPage from './pages/StockMovementsPage'
import BranchesPage from './pages/BranchesPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/painel/*" element={
          <AuthGuard>
            <PainelPage />
          </AuthGuard>
        } />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/stock" element={<StockPage />} />
                  <Route path="/stock/items" element={<StockItemsPage />} />
                  <Route path="/stock/batches" element={<StockBatchesPage />} />
                  <Route path="/stock/movements" element={<StockMovementsPage />} />
                  <Route path="/stock/branches" element={<BranchesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
