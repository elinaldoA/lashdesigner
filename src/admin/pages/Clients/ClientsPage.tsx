import { useState, useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../shared/components/Modal';
import { formatDate, formatCurrency } from '../../../shared/utils';
import type { Client } from '../../../shared/types';
import { Plus, Search, Edit2, Trash2, Phone, Mail, User, History } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  phone: z.string().min(8, 'Telefone obrigatório'),
  whatsapp: z.string().optional(),
  birthdate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ClientsPage() {
  const { clients, appointments, addClient, updateClient, deleteClient } = useStore(s => ({
    clients: s.clients, appointments: s.appointments,
    addClient: s.addClient, updateClient: s.updateClient, deleteClient: s.deleteClient,
  }));

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const filtered = useMemo(() =>
    clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)),
    [clients, search]);

  const openNew = () => { setEditClient(null); reset({}); setModalOpen(true); };
  const openEdit = (c: Client) => { setEditClient(c); reset(c); setModalOpen(true); };

  const onSubmit = (data: FormData) => {
    if (editClient) updateClient(editClient.id, data);
    else addClient({ ...data, source: 'manual' });
    setModalOpen(false);
  };

  const clientHistory = useMemo(() => {
    if (!historyClient) return [];
    return appointments
      .filter(a => a.clientId === historyClient.id)
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }, [historyClient, appointments]);

  const totalSpent = clientHistory.reduce((s, a) => s + (a.status === 'completed' ? a.price : 0), 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Novo Cliente</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Agendamentos</th>
                <th>Última visita</th>
                <th>Próx. manutenção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-600 text-sm font-semibold">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.birthdate && <p className="text-xs text-gray-400">Nasc: {formatDate(c.birthdate)}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="text-sm flex items-center gap-1"><Phone size={12} className="text-gray-400" />{c.phone}</p>
                      {c.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12} />{c.email}</p>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.source === 'website' ? 'badge-blue' : 'badge-gray'}`}>
                      {c.source === 'website' ? 'Site' : 'Manual'}
                    </span>
                  </td>
                  <td className="font-medium">{c.totalAppointments}</td>
                  <td className="text-gray-600 text-sm">{c.lastService ? formatDate(c.lastService) : '–'}</td>
                  <td>
                    {c.nextMaintenanceSuggested ? (
                      <span className="badge badge-pink text-xs">{formatDate(c.nextMaintenanceSuggested)}</span>
                    ) : '–'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setHistoryClient(c)} className="btn-ghost p-1.5" title="Histórico"><History size={14} /></button>
                      <button onClick={() => openEdit(c)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                      <button onClick={() => deleteClient(c.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editClient ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="label">Nome completo *</label>
              <input {...register('name')} className="input" placeholder="Ex: Ana Carolina" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Telefone *</label>
              <input {...register('phone')} className="input" placeholder="(11) 99999-9999" />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">WhatsApp</label>
              <input {...register('whatsapp')} className="input" placeholder="5511999999999" />
            </div>
            <div className="form-group col-span-2">
              <label className="label">E-mail</label>
              <input {...register('email')} type="email" className="input" placeholder="email@exemplo.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Data de nascimento</label>
              <input {...register('birthdate')} type="date" className="input" />
            </div>
            <div className="form-group col-span-2">
              <label className="label">Observações</label>
              <textarea {...register('notes')} className="input" rows={2} placeholder="Preferências, alergias..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary">{editClient ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyClient} onClose={() => setHistoryClient(null)} title={`Histórico – ${historyClient?.name}`} size="xl">
        {historyClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-pink-50 rounded-xl">
              <div><p className="text-xs text-gray-500">Total de visitas</p><p className="text-xl font-bold text-gray-900">{clientHistory.length}</p></div>
              <div><p className="text-xs text-gray-500">Total gasto</p><p className="text-xl font-bold text-pink-600">{formatCurrency(totalSpent)}</p></div>
            </div>
            {clientHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Sem histórico de serviços.</p>
            ) : (
              <div className="space-y-2">
                {clientHistory.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{a.serviceName}</p>
                      <p className="text-xs text-gray-400">{formatDate(a.date)} às {a.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(a.price)}</p>
                      <span className={`badge text-[10px] ${a.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{a.status === 'completed' ? 'Concluído' : a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
