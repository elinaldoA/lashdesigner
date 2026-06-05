import { useState, useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../shared/components/Modal';
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS, generateTimeSlots } from '../../../shared/utils';
import type { Appointment, AppointmentStatus } from '../../../shared/types';
import {
  Plus, Search, Calendar, Clock, Filter, ChevronLeft, ChevronRight,
  Trash2, Edit2, Lock
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const apptSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Data obrigatória'),
  time: z.string().min(1, 'Horário obrigatório'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']),
  notes: z.string().optional(),
});
type ApptForm = z.infer<typeof apptSchema>;

const blockSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  reason: z.string().optional(),
});
type BlockForm = z.infer<typeof blockSchema>;

const timeSlots = generateTimeSlots('08:00', '19:00', 30);

export default function AppointmentsPage() {
  const {
    appointments, clients, services, blockedSlots,
    addAppointment, updateAppointment, deleteAppointment,
    addBlockedSlot, removeBlockedSlot,
  } = useStore(s => ({
    appointments: s.appointments, clients: s.clients, services: s.services,
    blockedSlots: s.blockedSlots, addAppointment: s.addAppointment,
    updateAppointment: s.updateAppointment, deleteAppointment: s.deleteAppointment,
    addBlockedSlot: s.addBlockedSlot, removeBlockedSlot: s.removeBlockedSlot,
  }));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('');
  const [view, setView] = useState<'day' | 'list'>('day');
  const [modalOpen, setModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
    defaultValues: { date: dateStr, status: 'pending' },
  });

  const blockForm = useForm<BlockForm>({
    resolver: zodResolver(blockSchema),
    defaultValues: { date: dateStr },
  });

  const dayAppointments = useMemo(() =>
    appointments.filter(a => a.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, dateStr]);

  const dayBlocked = blockedSlots.filter(b => b.date === dateStr);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    if (search) list = list.filter(a =>
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    return list.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }, [appointments, search, filterStatus]);

  const openNew = () => {
    setEditAppt(null);
    reset({ date: dateStr, status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setEditAppt(a);
    reset({ clientId: a.clientId, serviceId: a.serviceId, date: a.date, time: a.time, status: a.status, notes: a.notes });
    setModalOpen(true);
  };

  const onSubmit = (data: ApptForm) => {
    const client = clients.find(c => c.id === data.clientId)!;
    const service = services.find(s => s.id === data.serviceId)!;
    if (editAppt) {
      updateAppointment(editAppt.id, { ...data, clientName: client.name, serviceName: service.name, price: service.price, duration: service.duration });
    } else {
      addAppointment({ ...data, clientName: client.name, serviceName: service.name, price: service.price, duration: service.duration, source: 'manual' });
    }
    setModalOpen(false);
  };

  const onBlock = (data: BlockForm) => {
    addBlockedSlot(data);
    setBlockModalOpen(false);
    blockForm.reset({ date: dateStr });
  };

  const statusOptions: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Agendamentos</h1>
        <div className="flex gap-2">
          <button onClick={() => setBlockModalOpen(true)} className="btn-ghost border border-gray-200 text-sm">
            <Lock size={15} /> Bloquear Horário
          </button>
          <button onClick={openNew} className="btn-primary text-sm">
            <Plus size={16} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button onClick={() => setView('day')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${view === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          <Calendar size={14} className="inline mr-1.5" />Dia
        </button>
        <button onClick={() => setView('list')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Lista
        </button>
      </div>

      {view === 'day' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar nav */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="btn-ghost p-1.5"><ChevronLeft size={18} /></button>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{format(selectedDate, 'dd/MM/yyyy')}</p>
                <p className="text-xs text-gray-400 capitalize">{format(selectedDate, 'EEEE', { locale: ptBR })}</p>
                {isToday(selectedDate) && <span className="badge badge-pink text-[10px] mt-0.5">Hoje</span>}
              </div>
              <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="btn-ghost p-1.5"><ChevronRight size={18} /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 3 - i + (3 - Math.min(i, 3)));
                const dd = addDays(selectedDate, i - 3);
                const count = appointments.filter(a => a.date === format(dd, 'yyyy-MM-dd')).length;
                return (
                  <button key={i} onClick={() => setSelectedDate(dd)}
                    className={`flex flex-col items-center p-1.5 rounded-lg text-xs transition-all ${format(dd, 'yyyy-MM-dd') === dateStr ? 'bg-pink-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <span className="capitalize">{format(dd, 'EEE', { locale: ptBR }).charAt(0)}</span>
                    <span className="font-semibold">{format(dd, 'd')}</span>
                    {count > 0 && <span className={`w-1 h-1 rounded-full mt-0.5 ${format(dd, 'yyyy-MM-dd') === dateStr ? 'bg-white' : 'bg-pink-400'}`} />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Bloqueios</p>
              {dayBlocked.length === 0 ? <p className="text-xs text-gray-400">Nenhum bloqueio</p> : dayBlocked.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg text-xs text-red-700">
                  <span><Lock size={10} className="inline mr-1" />{b.startTime}–{b.endTime}</span>
                  <button onClick={() => removeBlockedSlot(b.id)} className="hover:text-red-900"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Day schedule */}
          <div className="lg:col-span-2 card p-4">
            <h3 className="font-display font-semibold text-gray-900 mb-4">
              Agenda do dia · {dayAppointments.length} agendamento(s)
            </h3>
            {timeSlots.filter(t => t >= '08:00' && t <= '18:00').map(slot => {
              const appt = dayAppointments.find(a => a.time === slot);
              const blocked = dayBlocked.find(b => slot >= b.startTime && slot < b.endTime);
              return (
                <div key={slot} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 w-10 flex-shrink-0 pt-1">{slot}</span>
                  {blocked ? (
                    <div className="flex-1 px-3 py-1.5 bg-red-50 rounded-lg text-xs text-red-600 border border-red-200">
                      <Lock size={10} className="inline mr-1" />Bloqueado {blocked.reason && `· ${blocked.reason}`}
                    </div>
                  ) : appt ? (
                    <div className={`flex-1 px-3 py-2 rounded-lg border-l-2 bg-pink-50 border-pink-400 cursor-pointer hover:bg-pink-100 transition-colors`} onClick={() => openEdit(appt)}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{appt.clientName}</p>
                        <span className={`badge ${STATUS_COLORS[appt.status]} text-[10px]`}>{STATUS_LABELS[appt.status]}</span>
                      </div>
                      <p className="text-xs text-gray-500">{appt.serviceName} · {appt.duration}min · {formatCurrency(appt.price)}</p>
                    </div>
                  ) : (
                    <div className="flex-1 px-3 py-1 rounded-lg text-xs text-gray-300 hover:bg-gray-50 cursor-pointer transition-colors" onClick={openNew}>
                      Disponível
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder="Buscar cliente ou serviço..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="">Todos os status</option>
              {statusOptions.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          <div className="table-wrapper rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Data/Hora</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium text-gray-900">{a.clientName}</td>
                    <td className="text-gray-600">{a.serviceName}</td>
                    <td><p>{formatDate(a.date)}</p><p className="text-xs text-gray-400">{a.time} · {a.duration}min</p></td>
                    <td><span className={`badge ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span></td>
                    <td className="font-medium">{formatCurrency(a.price)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(a)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                        <button onClick={() => deleteAppointment(a.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editAppt ? 'Editar Agendamento' : 'Novo Agendamento'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="label">Cliente *</label>
              <select {...register('clientId')} className="input">
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.clientId && <p className="text-red-500 text-xs">{errors.clientId.message}</p>}
            </div>

            <div className="form-group col-span-2">
              <label className="label">Serviço *</label>
              <select {...register('serviceId')} className="input">
                <option value="">Selecione...</option>
                {services.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name} – {formatCurrency(s.price)}</option>)}
              </select>
              {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Data *</label>
              <input {...register('date')} type="date" className="input" />
              {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Horário *</label>
              <select {...register('time')} className="input">
                <option value="">Selecione...</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
            </div>

            <div className="form-group col-span-2">
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {statusOptions.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="label">Observações</label>
              <textarea {...register('notes')} className="input" rows={2} placeholder="Notas internas..." />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">{editAppt ? 'Salvar' : 'Agendar'}</button>
          </div>
        </form>
      </Modal>

      {/* Block Modal */}
      <Modal isOpen={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="Bloquear Horário">
        <form onSubmit={blockForm.handleSubmit(onBlock)} className="space-y-4">
          <div className="form-group">
            <label className="label">Data</label>
            <input {...blockForm.register('date')} type="date" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">De</label>
              <select {...blockForm.register('startTime')} className="input">
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Até</label>
              <select {...blockForm.register('endTime')} className="input">
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Motivo (opcional)</label>
            <input {...blockForm.register('reason')} className="input" placeholder="Ex: Almoço, compromisso pessoal..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setBlockModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">Bloquear</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
