import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { formatCurrency, formatDate, PAYMENT_LABELS } from '../../../shared/utils';
import type { SaleItem, PaymentMethod } from '../../../shared/types';
import { Plus, Trash2, ShoppingCart, Search, X } from 'lucide-react';
import Modal from '../../../shared/components/Modal';

const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'cash', 'credit', 'debit', 'transfer'];

export default function SalesPage() {
  const { clients, services, products, sales, addSale, addTransaction } = useStore(s => ({
    clients: s.clients, services: s.services, products: s.products,
    sales: s.sales, addSale: s.addSale, addTransaction: s.addTransaction,
  }));

  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [clientId, setClientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [search, setSearch] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity - (i.discount || 0), 0);
  const total = Math.max(0, subtotal - discount);

  const addToCart = (type: 'service' | 'product', id: string) => {
    const existing = cart.find(i => i.itemId === id && i.type === type);
    if (existing) {
      setCart(cart.map(i => i.itemId === id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      const svc = type === 'service' ? services.find(s => s.id === id) : null;
      const prd = type === 'product' ? products.find(p => p.id === id) : null;
      const item = svc || prd;
      if (!item) return;
      const newItem: SaleItem = { id: id, type, itemId: id, name: item.name, quantity: 1, price: item.price };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => setCart(cart.filter(i => i.itemId !== itemId));

  const finalizeSale = () => {
    if (cart.length === 0) return;
    const client = clients.find(c => c.id === clientId);
    addSale({
      clientId: clientId || undefined,
      clientName: client?.name,
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: 'completed',
    });
    addTransaction({
      type: 'income',
      category: 'Vendas',
      description: `Venda – ${client?.name || 'Avulso'} (${cart.map(i => i.name).join(', ')})`,
      amount: total,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
    });
    setCart([]);
    setClientId('');
    setDiscount(0);
    setModalOpen(false);
  };

  const filteredSales = sales.filter(s =>
    !search ||
    (s.clientName && s.clientName.toLowerCase().includes(search.toLowerCase())) ||
    s.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Vendas</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <ShoppingCart size={16} /> Nova Venda
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total de Vendas</p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Faturamento Total</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(sales.reduce((s, v) => s + v.total, 0))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Ticket Médio</p>
          <p className="text-2xl font-bold">{sales.length > 0 ? formatCurrency(sales.reduce((s, v) => s + v.total, 0) / sales.length) : formatCurrency(0)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Descontos concedidos</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(sales.reduce((s, v) => s + v.discount, 0))}</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Buscar por cliente ou item..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper rounded-none">
          <table className="table">
            <thead>
              <tr><th>Data</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th>Total</th></tr>
            </thead>
            <tbody>
              {filteredSales.map(s => (
                <tr key={s.id}>
                  <td className="text-sm">{formatDate(s.createdAt.split('T')[0])}</td>
                  <td className="font-medium">{s.clientName || 'Avulso'}</td>
                  <td className="text-xs text-gray-500 max-w-xs truncate">{s.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                  <td><span className="badge badge-gray">{PAYMENT_LABELS[s.paymentMethod]}</span></td>
                  <td className="font-bold text-gray-900">{formatCurrency(s.total)}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma venda encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Venda" size="xl">
        <div className="space-y-4">
          {/* Client */}
          <div className="form-group">
            <label className="label">Cliente (opcional)</label>
            <select className="input" value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Venda avulsa</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Services */}
            <div>
              <p className="label mb-2">Serviços</p>
              <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-2">
                {services.filter(s => s.active).map(s => (
                  <button key={s.id} onClick={() => addToCart('service', s.id)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-pink-50 rounded-lg text-sm transition-colors">
                    <span>{s.name}</span>
                    <span className="text-pink-600 font-medium">{formatCurrency(s.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <p className="label mb-2">Produtos</p>
              <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-2">
                {products.filter(p => p.quantity > 0).map(p => (
                  <button key={p.id} onClick={() => addToCart('product', p.id)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-purple-50 rounded-lg text-sm transition-colors">
                    <span>{p.name}</span>
                    <span className="text-purple-600 font-medium">{formatCurrency(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShoppingCart size={15} /> Carrinho ({cart.length} ite{cart.length !== 1 ? 'ns' : 'm'})
            </div>
            {cart.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">Adicione serviços ou produtos</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {cart.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div>
                      <span className={`badge ${item.type === 'service' ? 'badge-pink' : 'badge-blue'} text-[10px] mr-2`}>{item.type === 'service' ? 'Serviço' : 'Produto'}</span>
                      {item.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.itemId)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Desconto (R$)</label>
              <input type="number" className="input" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0} max={subtotal} />
            </div>
            <div className="form-group">
              <label className="label">Pagamento</label>
              <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-pink-50 rounded-xl">
            <span className="font-display font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-pink-600">{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button onClick={finalizeSale} disabled={cart.length === 0} className="btn-primary">
              <ShoppingCart size={16} /> Finalizar Venda
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
