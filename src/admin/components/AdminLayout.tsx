import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../shared/store/useStore';
import {
  LayoutDashboard, Calendar, Users, Package, ShoppingCart,
  TrendingUp, BarChart3, Globe, LogOut, Menu, X, Bell,
  MessageSquare, Store
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, badge: null },
  { to: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar, badge: null },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, badge: null },
  { to: '/admin/produtos', label: 'Estoque', icon: Package, badge: null },
  { to: '/admin/vendas', label: 'Vendas', icon: ShoppingCart, badge: null },
  { to: '/admin/pedidos', label: 'Pedidos Loja', icon: Store, badge: 'store' },
  { to: '/admin/fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp, badge: null },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3, badge: null },
  { to: '/admin/website', label: 'Gerenciar Site', icon: Globe, badge: null },
];

export default function AdminLayout() {
  const { user, logout, contactMessages, bookingRequests, storeOrders } = useStore(s => ({
    user: s.user,
    logout: s.logout,
    contactMessages: s.contactMessages,
    bookingRequests: s.bookingRequests,
    storeOrders: s.storeOrders,
  }));
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const unread = contactMessages.filter(m => !m.read).length;
  const pendingBookings = bookingRequests.filter(b => b.status === 'pending').length;
  const pendingStoreOrders = storeOrders.filter(o => o.status === 'pending').length;
  const notifications = unread + pendingBookings + pendingStoreOrders;

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">LD</span>
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 text-sm leading-tight">Lash Designer</p>
                <p className="text-xs text-gray-400">Painel Admin</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-1.5">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => {
            const badgeCount = badge === 'store' ? pendingStoreOrders : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="flex-1">{label}</span>}
                {sidebarOpen && badgeCount > 0 && (
                  <span className="w-5 h-5 bg-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 text-sm font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="btn-ghost p-1.5 text-gray-400 hover:text-red-500">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-ghost p-2 w-full justify-center text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-sm font-medium text-gray-500">Bem-vindo de volta,</h1>
            <p className="font-display font-semibold text-gray-900">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="btn-ghost text-sm gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg">
              <Globe size={14} />
              Ver Site
            </a>
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>
            {unread > 0 && (
              <button className="relative btn-ghost p-2">
                <MessageSquare size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unread}</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
