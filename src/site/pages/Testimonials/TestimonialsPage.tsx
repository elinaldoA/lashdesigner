import { useStore } from '../../../shared/store/useStore';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestimonialsPage() {
  const testimonials = useStore(s => s.testimonials.filter(t => t.approved));

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 text-center">
        <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Reviews</p>
        <h1 className="section-title">Depoimentos</h1>
        <p className="section-subtitle mx-auto mt-3 text-center">Veja o que nossas clientes falam sobre nós</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {testimonials.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p>Nenhum depoimento publicado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={18} className={i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-6 text-base">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                    {t.photo ? (
                      <img src={t.photo} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{t.clientName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.clientName}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12 p-8 bg-pink-50 rounded-2xl">
          <p className="font-display text-xl font-bold text-gray-900 mb-2">Quer compartilhar sua experiência?</p>
          <p className="text-gray-500 mb-4">Adoramos saber o que nossas clientes pensam!</p>
          <Link to="/contato" className="btn-primary">Enviar depoimento</Link>
        </div>
      </div>
    </div>
  );
}
