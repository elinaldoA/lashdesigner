import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency, generateTimeSlots } from '../../../shared/utils';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, Calendar, User, Scissors } from 'lucide-react';

const schema = z.object({
  serviceId: z.string().min(1, 'Selecione um serviço'),
  preferredDate: z.string().min(1, 'Data obrigatória'),
  preferredTime: z.string().min(1, 'Horário obrigatório'),
  clientName: z.string().min(2, 'Nome obrigatório'),
  clientEmail: z.string().email('E-mail inválido').or(z.literal('')),
  clientPhone: z.string().min(8, 'Telefone obrigatório'),
  clientWhatsapp: z.string().optional(),
  clientBirthdate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const STEPS = ['Serviço', 'Data/Hora', 'Dados', 'Confirmação'];
const timeSlots = generateTimeSlots('08:00', '18:30', 30);

export default function BookingPage() {
  const { services, appointments, blockedSlots, addBookingRequest } = useStore(s => ({
    services: s.services.filter(sv => sv.active),
    appointments: s.appointments,
    blockedSlots: s.blockedSlots,
    addBookingRequest: s.addBookingRequest,
  }));

  const [params] = useSearchParams();
  const preSelectedService = params.get('service') || '';
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: preSelectedService, preferredDate: '', preferredTime: '' },
  });

  const selectedServiceId = watch('serviceId');
  const selectedDate = watch('preferredDate');
  const selectedTime = watch('preferredTime');
  const selectedService = services.find(s => s.id === selectedServiceId);

  // Check availability
  const isTimeUnavailable = (date: string, time: string) => {
    const hasAppt = appointments.some(a =>
      a.date === date && a.time === time && a.status !== 'cancelled'
    );
    const isBlocked = blockedSlots.some(b =>
      b.date === date && time >= b.startTime && time < b.endTime
    );
    return hasAppt || isBlocked;
  };

  const onSubmit = async (data: FormData) => {
    const req = await addBookingRequest({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientWhatsapp: data.clientWhatsapp,
      clientBirthdate: data.clientBirthdate,
      serviceId: data.serviceId,
      serviceName: selectedService?.name || '',
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes,
    });
    setBookingCode(req.id.slice(0, 8).toUpperCase());
    setSubmitted(true);
  };

  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (step === 1) fields = ['serviceId'];
    if (step === 2) fields = ['preferredDate', 'preferredTime'];
    if (step === 3) fields = ['clientName', 'clientEmail', 'clientPhone'];
    const ok = await trigger(fields);
    if (ok) setStep(s => s + 1);
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="card p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Agendamento solicitado!</h1>
            <p className="text-gray-500 mb-4">Aguarde nossa confirmação. Entraremos em contato em breve.</p>
            <div className="p-4 bg-pink-50 rounded-xl mb-6">
              <p className="text-xs text-gray-500 mb-1">Código do agendamento</p>
              <p className="font-mono text-2xl font-bold text-pink-600">#{bookingCode}</p>
            </div>
            {selectedService && (
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Serviço:</strong> {selectedService.name}</p>
                <p><strong>Data:</strong> {selectedDate} às {selectedTime}</p>
              </div>
            )}
            <a href="/" className="btn-primary mt-6 w-full justify-center">Voltar para o início</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-12 text-center">
        <h1 className="section-title">Agendamento Online</h1>
        <p className="section-subtitle mx-auto mt-2 text-center">Escolha seu serviço e horário preferido</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <p className={`ml-2 text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-pink-600' : 'text-gray-400'}`}>{s}</p>
              {i < STEPS.length - 1 && <div className={`mx-3 h-0.5 w-8 sm:w-16 transition-all ${i + 1 < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6">
            {/* Step 1: Service */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2"><Scissors size={20} className="text-pink-500" /> Escolha o serviço</h2>
                <div className="space-y-3">
                  {services.map(s => (
                    <label key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedServiceId === s.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'}`}>
                      <input {...register('serviceId')} type="radio" value={s.id} className="sr-only" />
                      {s.image && <img src={s.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-pink-600 font-bold">{formatCurrency(s.price)}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{s.duration} min</span>
                        </div>
                      </div>
                      {selectedServiceId === s.id && <CheckCircle size={20} className="text-pink-500 flex-shrink-0" />}
                    </label>
                  ))}
                </div>
                {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId.message}</p>}
              </div>
            )}

            {/* Step 2: Date/Time */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2"><Calendar size={20} className="text-pink-500" /> Escolha data e horário</h2>
                <div className="form-group">
                  <label className="label">Data preferida *</label>
                  <input {...register('preferredDate')} type="date" className="input" min={new Date().toISOString().split('T')[0]} />
                  {errors.preferredDate && <p className="text-red-500 text-xs">{errors.preferredDate.message}</p>}
                </div>

                {selectedDate && (
                  <div>
                    <p className="label mb-2">Horário disponível *</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {timeSlots.map(slot => {
                        const unavailable = isTimeUnavailable(selectedDate, slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={unavailable}
                            onClick={() => { if (!unavailable) setValue('preferredTime', slot); }}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                              unavailable ? 'bg-gray-100 text-gray-300 cursor-not-allowed' :
                              selectedTime === slot ? 'bg-pink-500 text-white shadow' :
                              'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.preferredTime && <p className="text-red-500 text-xs mt-2">{errors.preferredTime.message}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Client data */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2"><User size={20} className="text-pink-500" /> Seus dados</h2>
                <div className="form-group">
                  <label className="label">Nome completo *</label>
                  <input {...register('clientName')} className="input" placeholder="Seu nome" />
                  {errors.clientName && <p className="text-red-500 text-xs">{errors.clientName.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Telefone *</label>
                  <input {...register('clientPhone')} className="input" placeholder="(11) 99999-9999" />
                  {errors.clientPhone && <p className="text-red-500 text-xs">{errors.clientPhone.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">WhatsApp (opcional)</label>
                  <input {...register('clientWhatsapp')} className="input" placeholder="5511999999999" />
                </div>
                <div className="form-group">
                  <label className="label">E-mail (opcional)</label>
                  <input {...register('clientEmail')} type="email" className="input" placeholder="seu@email.com" />
                  {errors.clientEmail && <p className="text-red-500 text-xs">{errors.clientEmail.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Data de nascimento (opcional)</label>
                  <input {...register('clientBirthdate')} type="date" className="input" />
                </div>
                <div className="form-group">
                  <label className="label">Observações (opcional)</label>
                  <textarea {...register('notes')} className="input" rows={3} placeholder="Alguma preferência ou informação relevante..." />
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-bold text-gray-900">Confirmar agendamento</h2>
                <div className="p-5 bg-pink-50 rounded-xl space-y-3 border border-pink-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Serviço</span>
                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Data</span>
                    <span className="font-semibold text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Horário</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duração</span>
                    <span className="font-semibold text-gray-900">{selectedService?.duration} min</span>
                  </div>
                  <div className="border-t border-pink-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Valor estimado</span>
                    <span className="text-xl font-bold text-pink-600">{selectedService ? formatCurrency(selectedService.price) : ''}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  ⚠️ O agendamento será confirmado após contato da nossa equipe.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost border border-gray-200">← Voltar</button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn-primary">Continuar →</button>
            ) : (
              <button type="submit" className="btn-primary"><CheckCircle size={16} /> Confirmar agendamento</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
