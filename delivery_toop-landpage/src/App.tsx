import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import StoreLandingPage from './pages/StoreLandingPage'
import DriverLandingPage from './pages/DriverLandingPage'
import SupermarketLandingPage from './pages/SupermarketLandingPage'
import FranchiseLandingPage from './pages/FranchiseLandingPage'
import ContactPage from './pages/ContactPage'
import LegalPage from './pages/LegalPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/supermercados" element={<SupermarketLandingPage />} />
        <Route path="/franquias" element={<FranchiseLandingPage />} />
        <Route path="/lojista" element={<StoreLandingPage />} />
        <Route path="/motorista" element={<DriverLandingPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/termos" element={<LegalPage />} />
        <Route path="/privacidade" element={<LegalPage />} />
        <Route path="/cookies" element={<LegalPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
