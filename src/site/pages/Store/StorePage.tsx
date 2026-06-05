import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Package, Star, Search, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../../../shared/store/useStore';
import { storePublicApi } from '../../../shared/services/api';
import type { StoreProduct, CartItem } from '../../../shared/types';

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX (5% de desconto)' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Cartão de Débito' },
  { value: 'transfer', label: 'Transferência Bancária' },
];

const ORDER_STATUS_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  transfer: 'Transferência',
};

export default function StorePage() {
  const { storeProducts, cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useStore(s => ({
    storeProducts:      s.storeProducts,
    cart:               s.cart,
    addToCart:          s.addToCart,
    removeFromCart:     s.removeFromCart,
    updateCartQuantity: s.updateCartQuantity,
    clearCart:          s.clearCart,
  }));

  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState('Todos');
  const [addedId, setAddedId]           = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    customerAddress: '', paymentMethod: 'pix', notes: '',
  });

  // Derived values
  const categories = ['Todos', ...Array.from(new Set(storeProducts.map(p => p.category)))];
  const filtered   = storeProducts.filter(p => {
    const matchCat = category === 'Todos' || p.category === category;
    const matchQ   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                     p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const cartCount   = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const pixDiscount  = form.paymentMethod === 'pix' ? cartSubtotal * 0.05 : 0;
  const cartTotal    = cartSubtotal - pixDiscount;

  function handleAdd(product: StoreProduct) {
    if (product.quantity === 0) return;
    addToCart({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone) return;
    setSubmitting(true);
    try {
      await storePublicApi.createOrder({
        ...form,
        items: cart.map(c => ({ productId: c.productId, name: c.name, price: c.price, quantity: c.quantity })),
      });
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrderDone(true);
      setForm({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', paymentMethod: 'pix', notes: '' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white py-14 px-4 text-center">
        <h1 className="font-display text-4xl font-bold mb-3">Nossa Loja</h1>
        <p className="text-pink-100 max-w-xl mx-auto">Produtos premium para cuidado dos seus cílios, entregues na sua porta.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === cat ? 'bg-pink-500 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative aspect-square bg-pink-50 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={40} className="text-pink-200" />
                    </div>
                  )}
                  {product.storeFeatured && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Destaque
                    </span>
                  )}
                  {product.quantity === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-500">Esgotado</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-pink-500 font-medium mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 mb-1 leading-tight">{product.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-lg font-bold text-pink-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <button
                      disabled={product.quantity === 0}
                      onClick={() => handleAdd(product)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        addedId === product.id
                          ? 'bg-green-500 text-white'
                          : product.quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-pink-500 hover:bg-pink-600 text-white'
                      }`}
                    >
                      {addedId === product.id ? <Check size={14} /> : <Plus size={14} />}
                      {addedId === product.id ? 'Adicionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 right-6 z-40 bg-pink-500 hover:bg-pink-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <ShoppingCart size={22} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full text-[10px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Cart sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl animate-slide-down">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Carrinho ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-14 h-14 rounded-lg bg-pink-50 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-pink-200" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-pink-600 font-semibold">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-white border flex items-center justify-center hover:bg-pink-50"><Minus size={12} /></button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-white border flex items-center justify-center hover:bg-pink-50"><Plus size={12} /></button>
                      <button onClick={() => removeFromCart(item.productId)} className="ml-auto text-gray-300 hover:text-red-400"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{cartSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <button
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Finalizar Pedido</h2>
              <button onClick={() => setCheckoutOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleCheckout} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input required className="input" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Seu nome" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
                  <input required className="input" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" className="input" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de entrega</label>
                <input className="input" value={form.customerAddress} onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))} placeholder="Rua, número, bairro, cidade – CEP" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento *</label>
                <select required className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Alguma observação?" />
              </div>

              {/* Order summary */}
              <div className="bg-pink-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-800 mb-2">Resumo do pedido</p>
                {cart.map(i => (
                  <div key={i.productId} className="flex justify-between text-gray-600">
                    <span>{i.name} × {i.quantity}</span>
                    <span>{(i.price * i.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                ))}
                {pixDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span>− {pixDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-pink-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-pink-600">{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order success modal */}
      {orderDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
            <p className="text-gray-500 mb-6">Recebemos seu pedido e entraremos em contato em breve para confirmar os detalhes.</p>
            <button onClick={() => setOrderDone(false)} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Continuar comprando
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
