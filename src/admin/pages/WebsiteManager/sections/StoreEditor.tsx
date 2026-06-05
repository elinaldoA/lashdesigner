import { useState } from 'react';
import { Package, Store, Star, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../../../../shared/store/useStore';

export default function StoreEditor() {
  const { products, updateProduct } = useStore(s => ({
    products:      s.products,
    updateProduct: s.updateProduct,
  }));

  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const visibleCount  = products.filter(p => p.storeVisible).length;
  const featuredCount = products.filter(p => p.storeFeatured).length;
  const lowStock      = products.filter(p => p.storeVisible && p.quantity <= p.minStock).length;

  async function toggleVisible(id: string, current: boolean) {
    setSaving(id + '-visible');
    const product = products.find(p => p.id === id)!;
    await updateProduct(id, {
      ...product,
      storeVisible: !current,
      storeFeatured: !current ? product.storeFeatured : false,
    });
    setSaving(null);
  }

  async function toggleFeatured(id: string, current: boolean) {
    setSaving(id + '-featured');
    const product = products.find(p => p.id === id)!;
    await updateProduct(id, { ...product, storeFeatured: !current });
    setSaving(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-gray-900">Produtos na Loja</h2>
        <p className="text-sm text-gray-500 mt-1">Selecione quais produtos do estoque aparecerão na loja online</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{visibleCount}</p>
          <p className="text-xs text-blue-500 mt-0.5">Visíveis na loja</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{featuredCount}</p>
          <p className="text-xs text-yellow-500 mt-0.5">Em destaque</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${lowStock > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-2xl font-bold ${lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStock}</p>
          <p className={`text-xs mt-0.5 ${lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>Estoque baixo</p>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{lowStock} produto(s) visível(is) na loja estão com estoque baixo ou zerado.</span>
        </div>
      )}

      {/* Search */}
      <input
        className="input"
        placeholder="Buscar produto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum produto cadastrado no estoque</p>
          <p className="text-xs mt-1">Adicione produtos em <strong>Estoque</strong> primeiro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => {
            const isLow = product.quantity <= product.minStock;
            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  product.storeVisible
                    ? 'bg-white border-pink-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                {/* Product image */}
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex-shrink-0 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-pink-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm truncate ${product.storeVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                      {product.name}
                    </p>
                    {product.storeFeatured && <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{product.category}</span>
                    <span className="font-medium text-pink-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className={isLow ? 'text-red-500 font-medium' : ''}>
                      {product.quantity} {product.unit}{isLow ? ' ⚠️' : ''}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* Featured toggle (only if visible) */}
                  {product.storeVisible && (
                    <button
                      title={product.storeFeatured ? 'Remover destaque' : 'Colocar em destaque'}
                      disabled={saving === product.id + '-featured'}
                      onClick={() => toggleFeatured(product.id, product.storeFeatured)}
                      className={`p-2 rounded-lg transition-all ${
                        product.storeFeatured
                          ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-300 hover:bg-yellow-50 hover:text-yellow-400'
                      }`}
                    >
                      <Star size={15} className={product.storeFeatured ? 'fill-current' : ''} />
                    </button>
                  )}

                  {/* Visible toggle */}
                  <button
                    title={product.storeVisible ? 'Ocultar da loja' : 'Mostrar na loja'}
                    disabled={saving === product.id + '-visible'}
                    onClick={() => toggleVisible(product.id, product.storeVisible)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      product.storeVisible
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {product.storeVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {product.storeVisible ? 'Visível' : 'Oculto'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
