import { useState } from 'react';
import { ShoppingBag, ChevronDown, Eye, Trash2, X, Package } from 'lucide-react';
import { useStore } from '../../../shared/store/useStore';
import type { StoreOrder, StoreOrderStatus } from '../../../shared/types';

const STATUS_CONFIG: Record<StoreOrderStatus, { label: string; classes: string }> = {
  pending:   { label: 'Pendente',   classes: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', classes: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Enviado',    classes: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregue',   classes: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado',  classes: 'bg-red-100 text-red-700' },
};

const STATUS_ORDER: StoreOrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX', credit: 'Crédito', debit: 'Débito', transfer: 'Transferência', cash: 'Dinheiro',
};

export default function StoreOrdersPage() {
  const { storeOrders, updateStoreOrderStatus, deleteStoreOrder } = useStore(s => ({
    storeOrders:           s.storeOrders,
    updateStoreOrderStatus: s.updateStoreOrderStatus,
    deleteStoreOrder:      s.deleteStoreOrder,
  }));

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filterStatus === 'all'
    ? storeOrders
    : storeOrders.filter(o => o.status === filterStatus);

  const total     = storeOrders.length;
  const pending   = storeOrders.filter(o => o.status === 'pending').length;
  const revenue   = storeOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  async function handleStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await updateStoreOrderStatus(id, status);
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: status as StoreOrderStatus } : null);
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este pedido permanentemente?')) return;
    await deleteStoreOrder(id);
    if (selectedOrder?.id === id) setSelectedOrder(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Pedidos da Loja</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie os pedidos realizados na loja online</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total de Pedidos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Receita Total</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
        >
          Todos ({total})
        </button>
        {STATUS_ORDER.map(s => {
          const cfg   = STATUS_CONFIG[s];
          const count = storeOrders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filterStatus === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Data', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items?.length ?? 0} item(s)</td>
                      <td className="px-4 py-3 font-semibold text-pink-600">
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <div className="relative group inline-block">
                          <button
                            disabled={updatingId === order.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.classes} cursor-pointer`}
                          >
                            {cfg.label} <ChevronDown size={12} />
                          </button>
                          <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 hidden group-hover:block">
                            {STATUS_ORDER.map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatus(order.id, s)}
                                className={`block w-full text-left px-3 py-2 text-xs hover:bg-pink-50 first:rounded-t-xl last:rounded-b-xl ${s === order.status ? 'font-semibold text-pink-600' : 'text-gray-700'}`}
                              >
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Detalhes do Pedido</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                  <p className="font-medium text-gray-900">{selectedOrder.customerPhone}</p>
                </div>
                {selectedOrder.customerEmail && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">E-mail</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerEmail}</p>
                  </div>
                )}
                {selectedOrder.customerAddress && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Endereço</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerAddress}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Itens do Pedido</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-pink-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{selectedOrder.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Desconto</span><span>− {selectedOrder.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-pink-200 pt-2">
                  <span>Total</span>
                  <span className="text-pink-600">{selectedOrder.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              {/* Status + Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <select
                    className="input text-sm"
                    value={selectedOrder.status}
                    onChange={e => handleStatus(selectedOrder.id, e.target.value)}
                    disabled={!!updatingId}
                  >
                    {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pagamento</p>
                  <p className="input text-sm bg-gray-50">{PAYMENT_LABELS[selectedOrder.paymentMethod] ?? selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Observações</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
