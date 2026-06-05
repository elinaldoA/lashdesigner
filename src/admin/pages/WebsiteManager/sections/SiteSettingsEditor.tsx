import { useForm } from 'react-hook-form';
import { useStore } from '../../../../shared/store/useStore';
import type { SiteSettings } from '../../../../shared/types';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function SiteSettingsEditor() {
  const { siteContent, updateSiteContent } = useStore(s => ({ siteContent: s.siteContent, updateSiteContent: s.updateSiteContent }));
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<SiteSettings>({ defaultValues: siteContent.settings });

  const onSubmit = (data: SiteSettings) => {
    updateSiteContent({ settings: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display font-semibold text-gray-900">Configurações do Site</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Nome do site</label>
            <input {...register('siteName')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Tagline / Slogan</label>
            <input {...register('tagline')} className="input" />
          </div>
        </div>

        <div>
          <p className="label mb-3">Cores do tema</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label text-xs">Cor primária</label>
              <div className="flex gap-2">
                <input {...register('primaryColor')} type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <input {...register('primaryColor')} className="input flex-1 text-xs" />
              </div>
            </div>
            <div className="form-group">
              <label className="label text-xs">Cor secundária</label>
              <div className="flex gap-2">
                <input {...register('secondaryColor')} type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <input {...register('secondaryColor')} className="input flex-1 text-xs" />
              </div>
            </div>
            <div className="form-group">
              <label className="label text-xs">Cor de destaque</label>
              <div className="flex gap-2">
                <input {...register('accentColor')} type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <input {...register('accentColor')} className="input flex-1 text-xs" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="label mb-3">Redes sociais</p>
          <div className="space-y-3">
            {['instagram', 'facebook', 'tiktok', 'youtube'].map(net => (
              <div key={net} className="form-group">
                <label className="label capitalize text-xs">{net}</label>
                <input {...register(`socialLinks.${net}` as any)} className="input" placeholder={`https://${net}.com/...`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label mb-3">SEO – Página Inicial</p>
          <div className="space-y-3">
            <div className="form-group">
              <label className="label text-xs">Meta título</label>
              <input {...register('seo.home.title')} className="input" />
            </div>
            <div className="form-group">
              <label className="label text-xs">Meta descrição</label>
              <textarea {...register('seo.home.description')} className="input" rows={2} />
            </div>
            <div className="form-group">
              <label className="label text-xs">Palavras-chave</label>
              <input {...register('seo.home.keywords')} className="input" />
            </div>
          </div>
        </div>

        <button type="submit" className={`btn-primary ${saved ? '!bg-green-500 !from-green-500 !to-green-600' : ''}`}>
          <Save size={16} />{saved ? 'Salvo!' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  );
}
