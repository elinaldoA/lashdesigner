import { useStore } from '../../../shared/store/useStore';
import { formatCurrency, formatDate } from '../../../shared/utils';
import {
  TrendingUp, Users, Calendar, Package, Eye, ArrowUp, ArrowDown,
  Clock, CheckCircle, AlertTriangle, MessageSquare
} from 'lucide-react';
import { isToday, parseISO, format, startOfMonth, endOfMonth } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function Dashboard() {
  const { clients, appointments, products, transactions, contactMessages, services, pageViews } = useStore(s => ({
    clients: s.clients,
    appointments: s.appointments,
    products: s.products,
    transactions: s.transactions,
    contactMessages: s.contactMessages,
    services: s.services,
    pageViews: s.pageViews,
  }));

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const todayAppts = appointments.filter(a => {
    try { return isToday(parseISO(a.date)); } catch { return false; }
  });

  const monthlyRevenue = useMemo(() => transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const monthlyExpenses = useMemo(() => transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const unreadMessages = contactMessages.filter(m => !m.read).length;

  // Chart data - last 7 days
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = format(d, 'yyyy-MM-dd');
      const income = transactions
        .filter(t => t.type === 'income' && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      return { date: format(d, 'dd/MM'), income, expense };
    });
    return days;
  }, [transactions]);

  const stats = [
    { label: 'Faturamento Mensal', value: formatCurrency(monthlyRevenue), icon: TrendingUp, color: 'bg-pink-50 text-pink-600', trend: '+12%' },
    { label: 'Agendamentos Hoje', value: todayAppts.length, icon: Calendar, color: 'bg-purple-50 text-purple-600', trend: `${todayAppts.filter(a => a.status === 'confirmed').length} conf.` },
    { label: 'Clientes Ativos', value: clients.length, icon: Users, color: 'bg-blue-50 text-blue-600', trend: 'Total cadastros' },
    { label: 'Estoque Baixo', value: lowStockProducts.length, icon: Package, color: 'bg-amber-50 text-amber-600', trend: 'Requer atenção' },
  ];

  const upcomingAppts = appointments
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: undefined })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || unreadMessages > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              <AlertTriangle size={16} />
              <span><strong>{lowStockProducts.length} produto(s)</strong> com estoque baixo</span>
            </div>
          )}
          {unreadMessages > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
              <MessageSquare size={16} />
              <span><strong>{unreadMessages} mensagem(ns)</strong> não lida(s)</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Receitas x Despesas</h3>
            <span className="badge badge-pink">Últimos 7 dias</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="income" name="Receita" stroke="#ec4899" fill="url(#income)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Despesa" stroke="#f43f5e" fill="url(#expense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <ArrowUp size={14} className="text-green-500" />
              <span className="text-gray-600">Receita: <strong className="text-gray-900">{formatCurrency(monthlyRevenue)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDown size={14} className="text-red-500" />
              <span className="text-gray-600">Despesas: <strong className="text-gray-900">{formatCurrency(monthlyExpenses)}</strong></span>
            </div>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Próximos Agendamentos</h3>
          {upcomingAppts.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem agendamentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppts.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-pink-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">{a.serviceName}</p>
                    <p className="text-xs text-pink-600 font-medium">{formatDate(a.date)} · {a.time}</p>
                  </div>
                  <span className={`badge ${a.status === 'confirmed' ? 'badge-green' : 'badge-yellow'} flex-shrink-0`}>
                    {a.status === 'confirmed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock */}
      {lowStockProducts.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Estoque Baixo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 border border-amber-200 bg-amber-50 rounded-xl">
                <Package size={18} className="text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-amber-700">{p.quantity} {p.unit}(s) · mínimo: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Eye size={20} className="mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{pageViews.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500">Visitas ao site</p>
        </div>
        <div className="card p-4 text-center">
          <CheckCircle size={20} className="mx-auto text-green-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
          <p className="text-xs text-gray-500">Serviços concluídos</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp size={20} className="mx-auto text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue - monthlyExpenses)}</p>
          <p className="text-xs text-gray-500">Lucro mensal</p>
        </div>
        <div className="card p-4 text-center">
          <Users size={20} className="mx-auto text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.active).length}</p>
          <p className="text-xs text-gray-500">Serviços ativos</p>
        </div>
      </div>
    </div>
  );
}
