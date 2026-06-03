import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { Footer } from './components/Footer/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TorneosPage } from './pages/TorneosPage/TorneosPage'
import { TorneoDetallePage } from './pages/TorneoDetallePage/TorneoDetallePage'
import { CrearTorneoPage } from './pages/CrearTorneoPage/CrearTorneoPage'
import { EditarTorneoPage } from './pages/EditarTorneoPage/EditarTorneoPage'
import { MisTorneosPage } from './pages/MisTorneosPage/MisTorneosPage'
import { PerfilPage } from './pages/PerfilPage/PerfilPage'
import { LoginPage } from './pages/Auth/LoginPage'
import { RegisterPage } from './pages/Auth/RegisterPage'
import { UnirseInvitacionPage } from './pages/UnirseInvitacionPage/UnirseInvitacionPage'

const SIN_FOOTER = ['/login', '/register', '/torneos/nuevo']

function Layout() {
  const { pathname } = useLocation()
  const mostrarFooter = !SIN_FOOTER.some(p => pathname === p || pathname.endsWith('/editar'))

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/torneos" replace />} />

        <Route path="/torneos"        element={<TorneosPage />} />
        <Route path="/torneos/:id"    element={<TorneoDetallePage />} />
        <Route path="/unirse/:codigo" element={<UnirseInvitacionPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/usuarios/:id"   element={<PerfilPage />} />

        <Route path="/mis-torneos" element={<ProtectedRoute><MisTorneosPage /></ProtectedRoute>} />
        <Route path="/torneos/nuevo"       element={<ProtectedRoute><CrearTorneoPage /></ProtectedRoute>} />
        <Route path="/torneos/:id/editar"  element={<ProtectedRoute><EditarTorneoPage /></ProtectedRoute>} />
      </Routes>
      {mostrarFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App