import { useState } from 'react';
import { useStore } from '../../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import Modal from '../../../../shared/components/Modal';
import type { Testimonial } from '../../../../shared/types';
import { Plus, Trash2, CheckCircle, XCircle, Star } from 'lucide-react';

type FormData = { clientName: string; photo?: string; text: string; rating: number; date: string };

export default function TestimonialsEditor() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useStore(s => ({
    testimonials: s.testimonials, addTestimonial: s.addTestimonial,
    updateTestimonial: s.updateTestimonial, deleteTestimonial: s.deleteTestimonial,
  }));
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { rating: 5, date: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (data: FormData) => {
    addTestimonial({ ...data, rating: Number(data.rating), approved: false, source: 'manual' });
    reset();
    setModalOpen(false);
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-gray-900">Depoimentos</h2>
          <p className="text-xs text-gray-500">{testimonials.filter(t => t.approved).length} aprovados · {testimonials.filter(t => !t.approved).length} pendentes</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus size={15} /> Adicionar</button>
      </div>

      <div className="space-y-3">
        {testimonials.map(t => (
          <div key={t.id} className={`p-4 rounded-xl border ${t.approved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{t.clientName}</p>
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={12} className={i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}</div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">"{t.text}"</p>
                <p className="text-xs text-gray-400 mt-1">{t.date} · {t.source === 'website' ? 'Site' : 'Manual'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => updateTestimonial(t.id, { approved: !t.approved })}
                  className={`p-1.5 rounded-lg transition-colors ${t.approved ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {t.approved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
                <button onClick={() => deleteTestimonial(t.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Adicionar depoimento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Nome da cliente *</label>
            <input {...register('clientName')} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">Depoimento *</label>
            <textarea {...register('text')} className="input" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Nota (1-5)</label>
              <input {...register('rating')} type="number" min={1} max={5} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Data</label>
              <input {...register('date')} type="date" className="input" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">URL da foto (opcional)</label>
            <input {...register('photo')} className="input" placeholder="https://..." />
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
