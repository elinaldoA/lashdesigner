import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import type { GalleryImage } from '../../../shared/types';

const CAT_LABELS: Record<GalleryImage['category'], string> = {
  'before-after': 'Antes/Depois',
  work: 'Trabalhos',
  studio: 'Estúdio',
  general: 'Geral',
};

export default function GalleryPage() {
  const gallery = useStore(s => s.gallery);
  const [filter, setFilter] = useState<string>('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const categories = [...new Set(gallery.map(g => g.category))];
  const filtered = filter ? gallery.filter(g => g.category === filter) : gallery;

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 text-center">
        <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Portfolio</p>
        <h1 className="section-title">Nossa Galeria</h1>
        <p className="section-subtitle mx-auto mt-3 text-center">Veja os resultados que entregamos às nossas clientes</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${filter === '' ? 'bg-pink-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todas
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${filter === cat ? 'bg-pink-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {CAT_LABELS[cat as GalleryImage['category']]}
            </button>
          ))}
        </div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.sort((a, b) => a.order - b.order).map(img => (
            <div
              key={img.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square bg-gray-100"
              onClick={() => setLightbox(img.url)}
            >
              <img src={img.url} alt={img.title || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                {img.title && <p className="text-white text-xs font-medium">{img.title}</p>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🖼️</p>
            <p>Nenhuma imagem nesta categoria.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-4xl max-h-[90vh] w-full object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition-colors" onClick={() => setLightbox(null)}>×</button>
        </div>
      )}
    </div>
  );
}
