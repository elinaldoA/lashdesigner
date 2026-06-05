import { useState, useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../shared/components/Modal';
import { formatCurrency } from '../../../shared/utils';
import type { Product } from '../../../shared/types';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria obrigatória'),
  price: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  unit: z.string().min(1),
  supplier: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Fios', 'Insumos', 'Ferramentas', 'Higiene', 'Outros'];

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore(s => ({
    products: s.products, addProduct: s.addProduct,
    updateProduct: s.updateProduct, deleteProduct: s.deleteProduct,
  }));

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterCat) list = list.filter(p => p.category === filterCat);
    if (filterLow) list = list.filter(p => p.quantity <= p.minStock);
    return list;
  }, [products, search, filterCat, filterLow]);

  const lowStock = products.filter(p => p.quantity <= p.minStock);

  const openNew = () => { setEditProduct(null); reset({ unit: 'unidade', minStock: 3 }); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); reset(p); setModalOpen(true); };

  const onSubmit = (data: FormData) => {
    if (editProduct) updateProduct(editProduct.id, data);
    else addProduct(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
    setModalOpen(false);
  };

  const stockColor = (p: Product) => {
    if (p.quantity === 0) return 'text-red-600 font-bold';
    if (p.quantity <= p.minStock) return 'text-amber-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          {lowStock.length > 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
              <AlertTriangle size={14} /> {lowStock.length} produto(s) com estoque baixo
            </p>
          )}
        </div>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Novo Produto</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total de itens</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Valor em estoque</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(products.reduce((s, p) => s + p.quantity * p.costPrice, 0))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-amber-600">Estoque baixo</p>
          <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-red-500">Sem estoque</p>
          <p className="text-2xl font-bold text-red-500">{products.filter(p => p.quantity === 0).length}</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <input type="checkbox" checked={filterLow} onChange={e => setFilterLow(e.target.checked)} className="rounded" />
            Estoque baixo
          </label>
        </div>

        <div className="table-wrapper rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Qtd</th>
                <th>Mínimo</th>
                <th>Preço Venda</th>
                <th>Custo</th>
                <th>Margem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const margin = p.costPrice > 0 ? ((p.price - p.costPrice) / p.price * 100).toFixed(0) : '--';
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Package size={14} className="text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          {p.supplier && <p className="text-xs text-gray-400">{p.supplier}</p>}
                        </div>
                        {p.quantity <= p.minStock && (
                          <AlertTriangle size={14} className="text-amber-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td className={stockColor(p)}>{p.quantity} {p.unit}</td>
                    <td className="text-gray-500">{p.minStock}</td>
                    <td className="font-medium">{formatCurrency(p.price)}</td>
                    <td className="text-gray-500">{formatCurrency(p.costPrice)}</td>
                    <td className="text-green-600 font-medium">{margin}%</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Editar Produto' : 'Novo Produto'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="label">Nome *</label>
              <input {...register('name')} className="input" placeholder="Ex: Cola Ultra Bond" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="form-group col-span-2">
              <label className="label">Descrição</label>
              <textarea {...register('description')} className="input" rows={2} />
            </div>
            <div className="form-group">
              <label className="label">Categoria *</label>
              <select {...register('category')} className="input">
                <option value="">Selecione...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Unidade</label>
              <input {...register('unit')} className="input" placeholder="unidade, caixa, ml..." />
            </div>
            <div className="form-group">
              <label className="label">Preço de venda (R$)</label>
              <input {...register('price')} type="number" step="0.01" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Custo (R$)</label>
              <input {...register('costPrice')} type="number" step="0.01" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Quantidade</label>
              <input {...register('quantity')} type="number" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Estoque mínimo</label>
              <input {...register('minStock')} type="number" className="input" />
            </div>
            <div className="form-group col-span-2">
              <label className="label">Fornecedor</label>
              <input {...register('supplier')} className="input" placeholder="Nome do fornecedor" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">{editProduct ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
