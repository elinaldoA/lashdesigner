import { useStore } from '../../../shared/store/useStore';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const { about } = useStore(s => s.siteContent);

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 text-center">
        <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Quem somos</p>
        <h1 className="section-title">{about.title}</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            {about.photo ? (
              <img src={about.photo} alt="Sobre" className="w-full rounded-2xl shadow-xl object-cover aspect-[4/3]" />
            ) : (
              <div className="w-full aspect-[4/3] bg-pink-50 rounded-2xl flex items-center justify-center text-6xl">✨</div>
            )}
          </div>
          <div>
            <p className="text-gray-600 leading-relaxed text-lg mb-8">{about.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 text-center">
                <p className="text-3xl font-display font-bold text-pink-600">{about.yearsExperience}+</p>
                <p className="text-sm text-gray-500">Anos de experiência</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-3xl font-display font-bold text-pink-600">{about.clientsServed.toLocaleString()}+</p>
                <p className="text-sm text-gray-500">Clientes atendidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Vision Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'Missão', text: about.mission, icon: '🎯' },
            { title: 'Visão', text: about.vision, icon: '👁️' },
          ].map(item => (
            <div key={item.title} className="card p-6">
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.text}</p>
            </div>
          ))}
          <div className="card p-6">
            <span className="text-3xl mb-3 block">💎</span>
            <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Valores</h3>
            <div className="space-y-2">
              {about.values.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-pink-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
