import { useForm } from 'react-hook-form';
import { useStore } from '../../../../shared/store/useStore';
import type { ContactInfo } from '../../../../shared/types';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function ContactEditor() {
  const { siteContent, updateSiteContent } = useStore(s => ({ siteContent: s.siteContent, updateSiteContent: s.updateSiteContent }));
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<ContactInfo>({ defaultValues: siteContent.contact });

  const onSubmit = (data: ContactInfo) => {
    updateSiteContent({ contact: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const days = siteContent.contact.businessHours;

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display font-semibold text-gray-900">Informações de Contato</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Telefone</label>
            <input {...register('phone')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">WhatsApp (com DDI)</label>
            <input {...register('whatsapp')} className="input" placeholder="5511999999999" />
          </div>
          <div className="form-group col-span-2">
            <label className="label">E-mail</label>
            <input {...register('email')} type="email" className="input" />
          </div>
          <div className="form-group col-span-2">
            <label className="label">Endereço</label>
            <input {...register('address')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Cidade</label>
            <input {...register('city')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Estado</label>
            <input {...register('state')} className="input" />
          </div>
          <div className="form-group col-span-2">
            <label className="label">Embed do Google Maps (iframe src)</label>
            <input {...register('mapEmbed')} className="input" placeholder="https://www.google.com/maps/embed?..." />
          </div>
        </div>

        <div>
          <p className="label mb-3">Horários de funcionamento</p>
          <div className="space-y-2">
            {days.map((day, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">{day.day}</span>
                <label className="flex items-center gap-1.5 text-xs">
                  <input {...register(`businessHours.${i}.closed`)} type="checkbox" className="rounded" />
                  Fechado
                </label>
                <input {...register(`businessHours.${i}.open`)} type="time" className="input text-xs h-8 px-2 w-24" />
                <span className="text-xs text-gray-400">às</span>
                <input {...register(`businessHours.${i}.close`)} type="time" className="input text-xs h-8 px-2 w-24" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className={`btn-primary ${saved ? '!bg-green-500 !from-green-500 !to-green-600' : ''}`}>
          <Save size={16} />{saved ? 'Salvo!' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
