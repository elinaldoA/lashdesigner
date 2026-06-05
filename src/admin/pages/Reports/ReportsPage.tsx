import { useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { formatCurrency } from '../../../shared/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Award, TrendingUp, Users, Scissors } from 'lucide-react';

const COLORS = ['#ec4899', '#be185d', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];

export default function ReportsPage() {
  const { appointments, clients, transactions, services } = useStore(s => ({
    appointments: s.appointments, clients: s.clients,
    transactions: s.transactions, services: s.services,
  }));

  const now = new Date();

  // Revenue last 6 months
  const revenueChart = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const ms = startOfMonth(d);
    const me = endOfMonth(d);
    const total = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= ms && new Date(t.date) <= me)
      .reduce((s, t) => s + t.amount, 0);
    return { month: format(d, 'MMM/yy', { locale: ptBR }), Faturamento: total };
  }), [transactions]);

  // Most sold services
  const serviceStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    appointments.filter(a => a.status === 'completed').forEach(a => {
      const existing = map.get(a.serviceId) || { name: a.serviceName, count: 0, revenue: 0 };
      map.set(a.serviceId, { name: existing.name, count: existing.count + 1, revenue: existing.revenue + a.price });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [appointments]);

  const pieData = serviceStats.map(s => ({ name: s.name, value: s.count }));

  // Loyal clients
  const loyalClients = useMemo(() =>
    [...clients]
      .filter(c => c.totalAppointments > 0)
      .sort((a, b) => b.totalAppointments - a.totalAppointments)
      .slice(0, 5),
    [clients]);

  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const completedAppts = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Relatórios</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <TrendingUp size={20} className="text-pink-500 mb-2" />
          <p className="text-xs text-gray-500">Faturamento total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <Scissors size={20} className="text-purple-500 mb-2" />
          <p className="text-xs text-gray-500">Serviços concluídos</p>
          <p className="text-xl font-bold text-gray-900">{completedAppts}</p>
        </div>
        <div className="card p-5">
          <Users size={20} className="text-blue-500 mb-2" />
          <p className="text-xs text-gray-500">Clientes cadastrados</p>
          <p className="text-xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="card p-5">
          <Award size={20} className="text-amber-500 mb-2" />
          <p className="text-xs text-gray-500">Ticket médio</p>
          <p className="text-xl font-bold text-gray-900">{completedAppts > 0 ? formatCurrency(totalRevenue / completedAppts) : formatCurrency(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="Faturamento" fill="#ec4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Services pie */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Serviços mais vendidos</h3>
          {serviceStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">Nenhum serviço concluído ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Service ranking */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Ranking de Serviços</h3>
          {serviceStats.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {serviceStats.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                      <span className="text-sm font-bold text-pink-600">{s.count}x</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" style={{ width: `${(s.count / serviceStats[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{formatCurrency(s.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyal clients */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Clientes Fiéis
          </h3>
          <div className="space-y-3">
            {loyalClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 text-sm font-semibold">{c.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.totalAppointments} visita(s)</p>
                </div>
                <span className="badge badge-pink">{c.totalAppointments}x</span>
              </div>
            ))}
            {loyalClients.length === 0 && <p className="text-gray-400 text-sm">Nenhum dado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
