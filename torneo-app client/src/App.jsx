import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TorneosPage } from './pages/TorneosPage'
import { CrearTorneoPage } from './pages/CrearTorneoPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/torneos" replace />} />

        {/* Rutas públicas */}
        <Route path="/torneos" element={<TorneosPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route path="/torneos/nuevo" element={
          <ProtectedRoute><CrearTorneoPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
