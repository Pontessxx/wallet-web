import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '@/contexts/AuthContext';
import CarteiraProvider from '@/contexts/CarteiraContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Login from '@/templates/Login';
import Signup from '@/templates/Signup';
import Dashboard from '@/templates/Dashboard';
import AppLayout from '@/templates/AppLayout';
import Carteira from '@/templates/Carteira';
import NotFound from '@/templates/NotFound';
import Configuration from './templates/Configuration';
import ForgotPassword from '@/templates/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas (auth) */}
          <Route path="/login" element={<Login />} caseSensitive />
          <Route path="/signup" element={<Signup />} caseSensitive />
          <Route path="/forgot-password" element={<ForgotPassword />} caseSensitive />

          {/* Rotas protegidas — todas usam o AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} caseSensitive />
            <Route
                path="/carteira"
                element={
                  <CarteiraProvider>
                    <Carteira />
                  </CarteiraProvider>
                }
                caseSensitive
              />
             <Route path="/configuracoes" element={<Configuration />} caseSensitive />
          </Route>

          {/* Rota raiz redireciona */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Qualquer rota não mapeada cai aqui */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;