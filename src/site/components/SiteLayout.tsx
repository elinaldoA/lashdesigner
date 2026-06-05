import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../shared/store/useStore';
import { useState, useEffect } from 'react';
import { Menu, X, Instagram, Facebook, Phone, MessageCircle } from 'lucide-react';
import { statsApi } from '../../shared/services/api';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/servicos', label: 'Serviços' },
  { to: '/loja', label: 'Loja' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/contato', label: 'Contato' },
];

export default function SiteLayout() {
  const { siteContent } = useStore(s => ({ siteContent: s.siteContent }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Rastreia cada visita ao site e incrementa o contador no banco
  useEffect(() => {
    statsApi.trackView().catch(() => {/* falha silenciosa */});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);


  const wa = siteContent.contact.whatsapp;
  const waUrl = `https://wa.me/${wa}?text=Olá! Vi seu site e gostaria de saber mais.`;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isHome ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {siteContent.settings.logo ? (
                <img src={siteContent.settings.logo} alt={siteContent.settings.siteName} className="h-9" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">LD</span>
                  </div>
                  <div>
                    <p className={`font-display font-bold text-sm leading-tight ${scrolled || !isHome ? 'text-gray-900' : 'text-white'}`}>{siteContent.settings.siteName}</p>
                    <p className={`text-[10px] leading-tight ${scrolled || !isHome ? 'text-gray-400' : 'text-white/70'}`}>{siteContent.settings.tagline}</p>
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-pink-600 bg-pink-50'
                        : scrolled || !isHome ? 'text-gray-700 hover:text-pink-600 hover:bg-pink-50' : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`
                  }>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/agendamento" className="btn-primary text-sm py-2 px-5">Agendar</Link>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg ${scrolled || !isHome ? 'text-gray-700' : 'text-white'}`}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down">
            <div className="p-4 space-y-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-gray-50'}`
                  }>
                  {label}
                </NavLink>
              ))}
              <Link to="/agendamento" className="btn-primary w-full justify-center mt-2 text-sm">Agendar Online</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">LD</span>
                </div>
                <div>
                  <p className="font-display font-bold text-white">{siteContent.settings.siteName}</p>
                  <p className="text-xs text-gray-500">{siteContent.settings.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Especialistas em extensão de cílios premium. Realçando sua beleza com técnica e cuidado.</p>
              <div className="flex items-center gap-3 mt-4">
                {siteContent.settings.socialLinks.instagram && (
                  <a href={siteContent.settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors">
                    <Instagram size={16} />
                  </a>
                )}
                {siteContent.settings.socialLinks.facebook && (
                  <a href={siteContent.settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                    <Facebook size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="font-semibold text-white mb-4">Navegação</p>
              <div className="space-y-2">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">{label}</Link>
                ))}
                <Link to="/agendamento" className="block text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors">Agendamento Online →</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-white mb-4">Contato</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>{siteContent.contact.address}</p>
                <p>{siteContent.contact.city} – {siteContent.contact.state}</p>
                <p className="flex items-center gap-1.5"><Phone size={14} />{siteContent.contact.phone}</p>
                <p className="flex items-center gap-1.5"><MessageCircle size={14} />{siteContent.contact.email}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} {siteContent.settings.siteName}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      {wa && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          title="WhatsApp">
          <MessageCircle size={26} className="text-white fill-white" />
        </a>
      )}
    </div>
  );
}
