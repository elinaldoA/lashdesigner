import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './shared/store/useStore';
import ErrorBoundary from './shared/components/ErrorBoundary';

// Admin pages — lazy loaded
const AdminLayout        = lazy(() => import('./admin/components/AdminLayout'));
const LoginPage          = lazy(() => import('./admin/pages/Login/LoginPage'));
const Dashboard          = lazy(() => import('./admin/pages/Dashboard/Dashboard'));
const AppointmentsPage   = lazy(() => import('./admin/pages/Appointments/AppointmentsPage'));
const ClientsPage        = lazy(() => import('./admin/pages/Clients/ClientsPage'));
const ProductsPage       = lazy(() => import('./admin/pages/Products/ProductsPage'));
const SalesPage          = lazy(() => import('./admin/pages/Sales/SalesPage'));
const CashFlowPage       = lazy(() => import('./admin/pages/CashFlow/CashFlowPage'));
const ReportsPage        = lazy(() => import('./admin/pages/Reports/ReportsPage'));
const WebsiteManagerPage = lazy(() => import('./admin/pages/WebsiteManager/WebsiteManagerPage'));
const StoreOrdersPage    = lazy(() => import('./admin/pages/StoreOrders/StoreOrdersPage'));

// Site pages — lazy loaded
const SiteLayout      = lazy(() => import('./site/components/SiteLayout'));
const HomePage        = lazy(() => import('./site/pages/Home/HomePage'));
const ServicesPage    = lazy(() => import('./site/pages/Services/ServicesPage'));
const AboutPage       = lazy(() => import('./site/pages/About/AboutPage'));
const GalleryPage     = lazy(() => import('./site/pages/Gallery/GalleryPage'));
const TestimonialsPage= lazy(() => import('./site/pages/Testimonials/TestimonialsPage'));
const ContactPage     = lazy(() => import('./site/pages/Contact/ContactPage'));
const BookingPage     = lazy(() => import('./site/pages/Booking/BookingPage'));
const StorePage       = lazy(() => import('./site/pages/Store/StorePage'));
const NotFoundPage    = lazy(() => import('./site/pages/NotFound/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function AppLoader({ children }: { children: React.ReactNode }) {
  const { checkAuth, loadAll, loadPublicData, loading, error } = useStore(s => ({
    checkAuth:       s.checkAuth,
    loadAll:         s.loadAll,
    loadPublicData:  s.loadPublicData,
    loading:         s.loading,
    error:           s.error,
  }));

  useEffect(() => {
    checkAuth().then(isAuth => {
      if (isAuth) loadAll();
      else loadPublicData();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="font-display font-semibold text-gray-700 text-lg">Carregando...</p>
          <p className="text-sm text-gray-400 mt-1">Conectando ao banco de dados</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-2xl font-bold">LD</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Erro de conexão
          </h1>
          <p className="text-gray-500 mb-6">
            Não foi possível conectar ao banco de dados. Verifique se o servidor backend está rodando.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-red-700 mb-1">Detalhe do erro:</p>
            <code className="text-xs text-red-600 break-all">{error}</code>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Para iniciar o backend:</p>
            <div className="space-y-2">
              {[
                'Abra um novo terminal',
                'cd lash-designer\\backend',
                'npm install',
                'npm run dev',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <code className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded font-mono flex-1">{step}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              O backend precisa estar ativo em <strong>http://localhost:3001</strong>
            </p>
          </div>

          <button
            onClick={() => loadPublicData()}
            className="btn-primary w-full justify-center text-base py-3"
          >
            Tentar reconectar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLoader>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Site institucional */}
              <Route path="/" element={<SiteLayout />}>
                <Route index element={<HomePage />} />
                <Route path="servicos" element={<ServicesPage />} />
                <Route path="sobre" element={<AboutPage />} />
                <Route path="galeria" element={<GalleryPage />} />
                <Route path="depoimentos" element={<TestimonialsPage />} />
                <Route path="contato" element={<ContactPage />} />
                <Route path="agendamento" element={<BookingPage />} />
                <Route path="loja" element={<StorePage />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="agendamentos" element={<AppointmentsPage />} />
                <Route path="clientes" element={<ClientsPage />} />
                <Route path="produtos" element={<ProductsPage />} />
                <Route path="vendas" element={<SalesPage />} />
                <Route path="fluxo-caixa" element={<CashFlowPage />} />
                <Route path="relatorios" element={<ReportsPage />} />
                <Route path="pedidos" element={<StoreOrdersPage />} />
                <Route path="website/*" element={<WebsiteManagerPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
