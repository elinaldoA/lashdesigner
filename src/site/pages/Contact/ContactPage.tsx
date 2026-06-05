import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Mensagem muito curta'),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { contact } = useStore(s => s.siteContent);
  const addContactMessage = useStore(s => s.addContactMessage);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    addContactMessage(data);
    setSent(true);
    reset();
  };

  const waUrl = `https://wa.me/${contact.whatsapp}?text=Olá! Gostaria de saber mais sobre os serviços.`;

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 text-center">
        <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Entre em contato</p>
        <h1 className="section-title">Fale conosco</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Informações de contato</h2>
            <div className="space-y-4 mb-8">
              <a href={`tel:${contact.phone}`} className="flex items-center gap-4 p-4 card-hover">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Telefone</p>
                  <p className="font-semibold text-gray-900">{contact.phone}</p>
                </div>
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 card-hover">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">WhatsApp</p>
                  <p className="font-semibold text-gray-900">Enviar mensagem →</p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-4 card">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">E-mail</p>
                  <p className="font-semibold text-gray-900">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 card">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Endereço</p>
                  <p className="font-semibold text-gray-900">{contact.address}, {contact.city} – {contact.state}</p>
                </div>
              </div>
            </div>

            {/* Business hours */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} className="text-pink-500" /> Horários</h3>
              <div className="space-y-1.5">
                {contact.businessHours.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{h.day}</span>
                    <span className={h.closed ? 'text-red-400 font-medium' : 'text-gray-900 font-medium'}>
                      {h.closed ? 'Fechado' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {contact.mapEmbed && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                <iframe src={contact.mapEmbed} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" title="Localização" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Mensagem enviada!</h3>
                <p className="text-gray-500">Retornaremos em breve. Obrigada pelo contato! 💕</p>
                <button onClick={() => setSent(false)} className="btn-primary mt-6 text-sm">Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="label">Nome *</label>
                  <input {...register('name')} className="input" placeholder="Seu nome" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">E-mail *</label>
                  <input {...register('email')} type="email" className="input" placeholder="seu@email.com" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Telefone</label>
                  <input {...register('phone')} className="input" placeholder="(11) 99999-9999" />
                </div>
                <div className="form-group">
                  <label className="label">Mensagem *</label>
                  <textarea {...register('message')} className="input" rows={5} placeholder="Como podemos ajudar você?" />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send size={16} /> Enviar mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
