import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import StoreLandingPage from './pages/StoreLandingPage'
import DriverLandingPage from './pages/DriverLandingPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lojista" element={<StoreLandingPage />} />
        <Route path="/motorista" element={<DriverLandingPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
