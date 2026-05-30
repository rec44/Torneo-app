import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TorneosPage } from './pages/TorneosPage'
import { TorneoDetallePage } from './pages/TorneoDetallePage'
import { CrearTorneoPage } from './pages/CrearTorneoPage'
import { EditarTorneoPage } from './pages/EditarTorneoPage'
import { MisTorneosPage } from './pages/MisTorneosPage'
import { PerfilPage } from './pages/PerfilPage'
import { PerfilPublicoPage } from './pages/PerfilPublicoPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UnirseInvitacionPage } from './pages/UnirseInvitacionPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/torneos" replace />} />

        {/* Rutas públicas */}
        <Route path="/torneos" element={<TorneosPage />} />
        <Route path="/torneos/:id" element={<TorneoDetallePage />} />
        <Route path="/unirse/:codigo" element={<UnirseInvitacionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/usuarios/:id" element={<PerfilPublicoPage />} />

        {/* Rutas protegidas */}
        <Route path="/mis-torneos" element={
          <ProtectedRoute><MisTorneosPage /></ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute><PerfilPage /></ProtectedRoute>
        } />
        <Route path="/torneos/nuevo" element={
          <ProtectedRoute><CrearTorneoPage /></ProtectedRoute>
        } />
        <Route path="/torneos/:id/editar" element={
          <ProtectedRoute><EditarTorneoPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
