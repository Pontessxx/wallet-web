import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '@/contexts/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Login from '@/templates/Login';
import Signup from '@/templates/Signup';
import Home from '@/templates/Home';
import AppLayout from '@/templates/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas (auth) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Rotas protegidas — todas usam o AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            {/* futuras páginas logadas, ex: */}
            {/* <Route path="/transacoes" element={<Transacoes />} /> */}
          </Route>

          {/* Rota raiz redireciona */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;