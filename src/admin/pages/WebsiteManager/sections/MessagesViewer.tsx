import { useStore } from '../../../../shared/store/useStore';
import { formatDateTime } from '../../../../shared/utils';
import { Mail, Trash2, Check } from 'lucide-react';

export default function MessagesViewer() {
  const { contactMessages, markMessageRead, deleteMessage } = useStore(s => ({
    contactMessages: s.contactMessages, markMessageRead: s.markMessageRead, deleteMessage: s.deleteMessage,
  }));

  const sorted = [...contactMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-gray-900">Mensagens de Contato</h2>
        <span className="badge badge-pink">{contactMessages.filter(m => !m.read).length} não lidas</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Mail size={32} className="mx-auto mb-2 opacity-40" />
          <p>Nenhuma mensagem recebida.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(m => (
            <div key={m.id} className={`p-4 rounded-xl border transition-all ${m.read ? 'border-gray-100 bg-gray-50' : 'border-pink-200 bg-pink-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    {!m.read && <span className="badge badge-pink text-[10px]">Novo</span>}
                    <span className="text-xs text-gray-400">{m.email}</span>
                  </div>
                  <p className="text-sm text-gray-700">{m.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(m.createdAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!m.read && (
                    <button onClick={() => markMessageRead(m.id)} className="btn-ghost p-1.5 text-green-600" title="Marcar como lida">
                      <Check size={15} />
                    </button>
                  )}
                  <a href={`mailto:${m.email}`} className="btn-ghost p-1.5" title="Responder por email">
                    <Mail size={15} />
                  </a>
                  <button onClick={() => deleteMessage(m.id)} className="btn-ghost p-1.5 hover:text-red-500" title="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
