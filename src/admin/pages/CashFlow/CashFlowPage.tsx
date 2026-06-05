import { useState, useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../shared/components/Modal';
import { formatCurrency, formatDate, PAYMENT_LABELS } from '../../../shared/utils';
import type { Transaction, TransactionType, PaymentMethod } from '../../../shared/types';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, Edit2, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  paymentMethod: z.string().optional(),
  date: z.string().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const INCOME_CATS = ['Serviços', 'Vendas', 'Outros receitas'];
const EXPENSE_CATS = ['Aluguel', 'Insumos', 'Marketing', 'Pessoal', 'Equipamentos', 'Outros gastos'];

export default function CashFlowPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useStore(s => ({
    transactions: s.transactions, addTransaction: s.addTransaction,
    updateTransaction: s.updateTransaction, deleteTransaction: s.deleteTransaction,
  }));

  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'income', date: new Date().toISOString().split('T')[0] },
  });
  const txType = watch('type');

  const monthStart = new Date(`${filterMonth}-01`);
  const monthEnd = endOfMonth(monthStart);

  const monthTransactions = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd && (!filterType || t.type === filterType);
    }).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, filterMonth, filterType]);

  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart: last 6 months
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const inc = transactions.filter(t => t.type === 'income' && new Date(t.date) >= ms && new Date(t.date) <= me).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= ms && new Date(t.date) <= me).reduce((s, t) => s + t.amount, 0);
      return { month: format(d, 'MMM', { locale: ptBR }), Receitas: inc, Despesas: exp, Lucro: inc - exp };
    });
  }, [transactions]);

  const openNew = () => { setEditTx(null); reset({ type: 'income', date: new Date().toISOString().split('T')[0] }); setModalOpen(true); };
  const openEdit = (t: Transaction) => { setEditTx(t); reset(t); setModalOpen(true); };

  const onSubmit = (data: FormData) => {
    const payload = { ...data, type: data.type as TransactionType, paymentMethod: data.paymentMethod as PaymentMethod | undefined };
    if (editTx) updateTransaction(editTx.id, payload);
    else addTransaction(payload);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Fluxo de Caixa</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Nova Transação</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="stat-icon bg-green-50 text-green-600"><TrendingUp size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">Receitas do mês</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="stat-icon bg-red-50 text-red-500"><TrendingDown size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">Despesas do mês</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className={`card p-5 flex items-center gap-4 ${balance >= 0 ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-400'}`}>
          <div className={`stat-icon ${balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}><Wallet size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">Saldo mensal</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-gray-900 mb-4">Evolução nos últimos 6 meses</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions list */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input type="month" className="input w-auto" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
          <select className="input w-auto" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        <div className="table-wrapper rounded-none">
          <table className="table">
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {monthTransactions.map(t => (
                <tr key={t.id}>
                  <td className="text-sm">{formatDate(t.date)}</td>
                  <td className="font-medium">{t.description}</td>
                  <td><span className="badge badge-gray">{t.category}</span></td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                      {t.type === 'income' ? '↑ Receita' : '↓ Despesa'}
                    </span>
                  </td>
                  <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                      <button onClick={() => deleteTransaction(t.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {monthTransactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma transação encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTx ? 'Editar Transação' : 'Nova Transação'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Tipo *</label>
            <div className="grid grid-cols-2 gap-2">
              {(['income', 'expense'] as TransactionType[]).map(t => (
                <label key={t} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${txType === t ? (t === 'income' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-200 hover:border-gray-300'}`}>
                  <input {...register('type')} type="radio" value={t} className="sr-only" />
                  <span className="font-medium text-sm">{t === 'income' ? '↑ Receita' : '↓ Despesa'}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Categoria</label>
            <select {...register('category')} className="input">
              <option value="">Selecione...</option>
              {(txType === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Descrição *</label>
            <input {...register('description')} className="input" placeholder="Ex: Atendimento Volume Russo" />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Valor (R$) *</label>
              <input {...register('amount')} type="number" step="0.01" className="input" min={0} />
              {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Data *</label>
              <input {...register('date')} type="date" className="input" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Observações</label>
            <textarea {...register('notes')} className="input" rows={2} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">{editTx ? 'Salvar' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
