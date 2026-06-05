import { useState } from 'react';
import { useStore } from '../../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../../shared/components/Modal';
import { formatCurrency } from '../../../../shared/utils';
import type { Service } from '../../../../shared/types';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(1),
  category: z.string().min(1),
  image: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function ServicesEditor() {
  const { services, addService, updateService, deleteService } = useStore(s => ({
    services: s.services, addService: s.addService,
    updateService: s.updateService, deleteService: s.deleteService,
  }));
  const [modalOpen, setModalOpen] = useState(false);
  const [editSvc, setEditSvc] = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditSvc(null); reset({ active: true, featured: false }); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditSvc(s); reset(s); setModalOpen(true); };
  const onSubmit = (data: FormData) => {
    if (editSvc) updateService(editSvc.id, data);
    else addService(data as Service);
    setModalOpen(false);
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-gray-900">Serviços</h2>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={15} /> Novo Serviço</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {services.map(s => (
          <div key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border ${s.active ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
            {s.image && <img src={s.image} alt={s.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
            {!s.image && <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0"><span className="text-pink-300 text-xl">✂</span></div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{s.name}</p>
                {s.featured && <span className="badge badge-yellow"><Star size={9} /> Destaque</span>}
                {!s.active && <span className="badge badge-gray">Inativo</span>}
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>
              <p className="text-sm text-pink-600 font-medium mt-1">{formatCurrency(s.price)} · {s.duration} min</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => updateService(s.id, { active: !s.active })} className="btn-ghost p-1.5" title={s.active ? 'Desativar' : 'Ativar'}>
                {s.active ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button onClick={() => updateService(s.id, { featured: !s.featured })} className={`btn-ghost p-1.5 ${s.featured ? 'text-yellow-500' : ''}`} title="Toggle destaque">
                <Star size={15} />
              </button>
              <button onClick={() => openEdit(s)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
              <button onClick={() => deleteService(s.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSvc ? 'Editar Serviço' : 'Novo Serviço'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Nome *</label>
            <input {...register('name')} className="input" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Descrição *</label>
            <textarea {...register('description')} className="input" rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="form-group">
              <label className="label">Preço (R$)</label>
              <input {...register('price')} type="number" step="0.01" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Duração (min)</label>
              <input {...register('duration')} type="number" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Categoria</label>
              <input {...register('category')} className="input" placeholder="Volume, Clássico..." />
            </div>
          </div>
          <div className="form-group">
            <label className="label">URL da imagem</label>
            <input {...register('image')} className="input" placeholder="https://..." />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('active')} type="checkbox" className="rounded" /> Ativo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('featured')} type="checkbox" className="rounded" /> Destaque no site
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">{editSvc ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
