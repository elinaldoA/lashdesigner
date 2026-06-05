import { useForm } from 'react-hook-form';
import { useStore } from '../../../../shared/store/useStore';
import type { HeroContent } from '../../../../shared/types';
import { Save, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function HeroEditor() {
  const { siteContent, updateSiteContent } = useStore(s => ({ siteContent: s.siteContent, updateSiteContent: s.updateSiteContent }));
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<HeroContent>({ defaultValues: siteContent.hero });

  const onSubmit = (data: HeroContent) => {
    updateSiteContent({ hero: { ...data, overlayOpacity: Number(data.overlayOpacity) } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-gray-900">Hero – Página Inicial</h2>
          <p className="text-sm text-gray-500">Edite o banner principal do site</p>
        </div>
        <a href="/" target="_blank" className="btn-ghost text-sm"><ExternalLink size={14} /> Ver no site</a>
      </div>

      {/* Preview */}
      <div className="relative rounded-xl overflow-hidden h-40 bg-gray-900">
        <img src={siteContent.hero.backgroundImage} alt="hero preview" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <p className="text-lg font-display font-bold">{siteContent.hero.title}</p>
          <p className="text-xs opacity-80 mt-1">{siteContent.hero.subtitle}</p>
          <span className="mt-2 px-4 py-1 bg-pink-500 rounded-lg text-xs">{siteContent.hero.ctaText}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label className="label">Título principal</label>
          <input {...register('title')} className="input" />
        </div>
        <div className="form-group">
          <label className="label">Subtítulo</label>
          <textarea {...register('subtitle')} className="input" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Texto do botão CTA</label>
            <input {...register('ctaText')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Link do botão</label>
            <input {...register('ctaLink')} className="input" placeholder="/agendamento" />
          </div>
        </div>
        <div className="form-group">
          <label className="label">URL da imagem de fundo</label>
          <input {...register('backgroundImage')} className="input" placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="label">Opacidade do overlay (0-1): <strong>{siteContent.hero.overlayOpacity}</strong></label>
          <input {...register('overlayOpacity')} type="range" min={0} max={1} step={0.05} className="w-full" />
        </div>
        <button type="submit" className={`btn-primary ${saved ? '!bg-green-500 !from-green-500 !to-green-600' : ''}`}>
          <Save size={16} />{saved ? 'Salvo!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
