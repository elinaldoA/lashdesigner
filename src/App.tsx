import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './shared/store/useStore';

// Admin pages
import AdminLayout from './admin/components/AdminLayout';
import LoginPage from './admin/pages/Login/LoginPage';
import Dashboard from './admin/pages/Dashboard/Dashboard';
import AppointmentsPage from './admin/pages/Appointments/AppointmentsPage';
import ClientsPage from './admin/pages/Clients/ClientsPage';
import ProductsPage from './admin/pages/Products/ProductsPage';
import SalesPage from './admin/pages/Sales/SalesPage';
import CashFlowPage from './admin/pages/CashFlow/CashFlowPage';
import ReportsPage from './admin/pages/Reports/ReportsPage';
import WebsiteManagerPage from './admin/pages/WebsiteManager/WebsiteManagerPage';
import StoreOrdersPage from './admin/pages/StoreOrders/StoreOrdersPage';

// Site pages
import SiteLayout from './site/components/SiteLayout';
import HomePage from './site/pages/Home/HomePage';
import ServicesPage from './site/pages/Services/ServicesPage';
import AboutPage from './site/pages/About/AboutPage';
import GalleryPage from './site/pages/Gallery/GalleryPage';
import TestimonialsPage from './site/pages/Testimonials/TestimonialsPage';
import ContactPage from './site/pages/Contact/ContactPage';
import BookingPage from './site/pages/Booking/BookingPage';
import StorePage from './site/pages/Store/StorePage';

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
      // Se autenticado carrega tudo; caso contrário, só dados públicos
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
    <BrowserRouter>
      <AppLoader>
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
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}
