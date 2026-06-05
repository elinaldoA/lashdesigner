import { useStore } from '../../../shared/store/useStore';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils';
import { Clock, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = useStore(s => s.services.filter(s => s.active));
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="pt-16">
      {/* Page header */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 text-center">
        <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Técnicas exclusivas</p>
        <h1 className="section-title">Nossos Serviços</h1>
        <p className="section-subtitle mx-auto mt-3 text-center">Escolha a técnica ideal para o seu estilo</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categories.map(cat => {
          const catServices = services.filter(s => s.category === cat);
          return (
            <div key={cat} className="mb-14">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
                {cat}
                <span className="h-px flex-1 bg-gradient-to-r from-pink-200 to-transparent" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catServices.map(s => (
                  <div key={s.id} className="card-hover group overflow-hidden">
                    <div className="aspect-video bg-pink-50 overflow-hidden">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-pink-200">✂</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{s.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.description}</p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-2xl font-bold text-pink-600">{formatCurrency(s.price)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={12} />{s.duration} minutos</p>
                        </div>
                        <Link to={`/agendamento?service=${s.id}`} className="btn-primary text-sm py-2 px-4">
                          Agendar <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
