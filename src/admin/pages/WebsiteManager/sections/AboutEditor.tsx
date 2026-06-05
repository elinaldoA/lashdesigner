import { useForm } from 'react-hook-form';
import { useStore } from '../../../../shared/store/useStore';
import type { AboutContent } from '../../../../shared/types';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function AboutEditor() {
  const { siteContent, updateSiteContent } = useStore(s => ({ siteContent: s.siteContent, updateSiteContent: s.updateSiteContent }));
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<AboutContent>({ defaultValues: siteContent.about });

  const onSubmit = (data: AboutContent) => {
    updateSiteContent({ about: { ...data, yearsExperience: Number(data.yearsExperience), clientsServed: Number(data.clientsServed), values: typeof data.values === 'string' ? (data.values as unknown as string).split(',').map(v => v.trim()) : data.values } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-display font-semibold text-gray-900">Página Sobre</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label className="label">Título</label>
          <input {...register('title')} className="input" />
        </div>
        <div className="form-group">
          <label className="label">Descrição institucional</label>
          <textarea {...register('description')} className="input" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Missão</label>
            <textarea {...register('mission')} className="input" rows={3} />
          </div>
          <div className="form-group">
            <label className="label">Visão</label>
            <textarea {...register('vision')} className="input" rows={3} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Valores (separados por vírgula)</label>
          <input {...register('values')} className="input" placeholder="Qualidade, Cuidado, Inovação..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Anos de experiência</label>
            <input {...register('yearsExperience')} type="number" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Clientes atendidos</label>
            <input {...register('clientsServed')} type="number" className="input" />
          </div>
        </div>
        <div className="form-group">
          <label className="label">URL da foto</label>
          <input {...register('photo')} className="input" placeholder="https://..." />
        </div>
        <button type="submit" className={`btn-primary ${saved ? '!bg-green-500 !from-green-500 !to-green-600' : ''}`}>
          <Save size={16} />{saved ? 'Salvo!' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
