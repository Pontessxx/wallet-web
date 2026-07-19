import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '@/contexts/AuthContext';
import CarteiraProvider from '@/contexts/CarteiraContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import CategoriaProvider from '@/contexts/CategoriaContext';
import GoalProvider from '@/contexts/GoalContext';
import TransferProvider from '@/contexts/TransferContext';
import ExchangeProvider from '@/contexts/ExchangeContext';
import TransactionProvider from '@/contexts/TransactionContext';

const Login = lazy(() => import('@/templates/Login'));
const Signup = lazy(() => import('@/templates/Signup'));
const ForgotPassword = lazy(() => import('@/templates/ForgotPassword'));
const ProtectedLayout = lazy(() => import('@/templates/AppLayout'));
const Dashboard = lazy(() => import('@/templates/Dashboard'));
const Carteira = lazy(() => import('@/templates/Carteira'));
const Categoria = lazy(() => import('@/templates/Categoria'));
const Configuration = lazy(() => import('@/templates/Configuration'));
const Transaction = lazy(() => import('@/templates/Transaction'));
const Objetivo = lazy(() => import('@/templates/Objetivo'));
const OperacaoBolsa = lazy(() => import('@/templates/OperacaoBolsa'));
const NotFound = lazy(() => import('@/templates/NotFound'));

const routeFallback = <div style={{ padding: '1rem' }}>Carregando...</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={routeFallback}>
          <Routes>
            {/* Rotas públicas (auth) */}
            <Route path="/login" element={<Login />} caseSensitive />
            <Route path="/signup" element={<Signup />} caseSensitive />
            <Route path="/forgot-password" element={<ForgotPassword />} caseSensitive />

            {/* Rotas protegidas — todas usam o AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} caseSensitive />
              <Route
                path="/transacoes"
                element={
                  <TransactionProvider>
                    <TransferProvider>
                      <CategoriaProvider>
                        <Transaction />
                      </CategoriaProvider>
                    </TransferProvider>
                  </TransactionProvider>
                }
                caseSensitive
              />
              <Route
                path="/objetivos"
                element={
                  <CategoriaProvider>
                    <CarteiraProvider>
                      <GoalProvider>
                        <Objetivo />
                      </GoalProvider>
                    </CarteiraProvider>
                  </CategoriaProvider>
                }
                caseSensitive
              />
              <Route
                path="/operacoes-bolsa"
                element={
                  <ExchangeProvider>
                    <OperacaoBolsa />
                  </ExchangeProvider>
                }
                caseSensitive
              />
              <Route
                  path="/carteira"
                  element={
                    <CarteiraProvider>
                      <Carteira />
                    </CarteiraProvider>
                  }
                  caseSensitive
                />
                <Route
                    path="/categorias"
                    element={
                      <CategoriaProvider>
                        <Categoria />
                      </CategoriaProvider>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;