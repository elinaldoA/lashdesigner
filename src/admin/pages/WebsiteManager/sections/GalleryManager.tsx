import { useState } from 'react';
import { useStore } from '../../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import Modal from '../../../../shared/components/Modal';
import type { GalleryImage } from '../../../../shared/types';
import { Plus, Trash2, Image } from 'lucide-react';

type FormData = { url: string; title?: string; category: GalleryImage['category'] };

export default function GalleryManager() {
  const { gallery, addGalleryImage, deleteGalleryImage } = useStore(s => ({
    gallery: s.gallery, addGalleryImage: s.addGalleryImage, deleteGalleryImage: s.deleteGalleryImage,
  }));
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('');

  const { register, handleSubmit, reset } = useForm<FormData>({ defaultValues: { category: 'general' } });

  const onSubmit = (data: FormData) => {
    addGalleryImage({ url: data.url, title: data.title, category: data.category, order: gallery.length + 1 });
    reset();
    setModalOpen(false);
  };

  const filtered = filter ? gallery.filter(g => g.category === filter) : gallery;

  const catLabels: Record<GalleryImage['category'], string> = {
    'before-after': 'Antes/Depois',
    work: 'Trabalhos',
    studio: 'Estúdio',
    general: 'Geral',
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-gray-900">Galeria</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus size={15} /> Adicionar foto</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'before-after', 'work', 'studio', 'general'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${filter === cat ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat === '' ? 'Todas' : catLabels[cat as GalleryImage['category']]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(img => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
            <img src={img.url} alt={img.title || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              {img.title && <p className="text-white text-xs font-medium">{img.title}</p>}
              <span className="badge bg-white/20 text-white">{catLabels[img.category]}</span>
              <button onClick={() => deleteGalleryImage(img.id)} className="btn-danger text-xs py-1 px-2">
                <Trash2 size={12} /> Remover
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-gray-400">
            <Image size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Nenhuma imagem nesta categoria.</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Adicionar imagem">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">URL da imagem *</label>
            <input {...register('url')} className="input" placeholder="https://..." required />
          </div>
          <div className="form-group">
            <label className="label">Título (opcional)</label>
            <input {...register('title')} className="input" placeholder="Ex: Volume Russo resultado" />
          </div>
          <div className="form-group">
            <label className="label">Categoria</label>
            <select {...register('category')} className="input">
              <option value="before-after">Antes/Depois</option>
              <option value="work">Trabalhos</option>
              <option value="studio">Estúdio</option>
              <option value="general">Geral</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
