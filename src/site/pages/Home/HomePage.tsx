import { useStore } from '../../../shared/store/useStore';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils';
import { ArrowRight, Star, Clock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { siteContent, services, testimonials } = useStore(s => ({
    siteContent: s.siteContent,
    services: s.services,
    testimonials: s.testimonials,
  }));

  const { hero, about } = siteContent;
  const featuredServices = services.filter(s => s.featured && s.active).slice(0, 4);
  const approvedTestimonials = testimonials.filter(t => t.approved).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${hero.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" style={{ opacity: hero.overlayOpacity + 0.1 }} />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            Extensão de cílios premium
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight animate-slide-up">
            {hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-10 leading-relaxed max-w-2xl mx-auto animate-slide-up">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to={hero.ctaLink} className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-pink-500/30">
              {hero.ctaText} <ArrowRight size={18} />
            </Link>
            <Link to="/servicos" className="px-8 py-3.5 border-2 border-white/40 text-white rounded-xl hover:bg-white/10 transition-all font-semibold text-base">
              Ver Serviços
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-display font-bold">{about.yearsExperience}+</p>
              <p className="text-sm text-white/80">Anos de experiência</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{about.clientsServed.toLocaleString()}+</p>
              <p className="text-sm text-white/80">Clientes atendidas</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{services.filter(s => s.active).length}+</p>
              <p className="text-sm text-white/80">Serviços disponíveis</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold">100%</p>
              <p className="text-sm text-white/80">Satisfação garantida</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Nossos Serviços</p>
              <h2 className="section-title">Técnicas que<br /><span className="gradient-text">Transformam</span></h2>
              <p className="section-subtitle mx-auto text-center mt-3">Cada técnica é realizada com produtos premium e muito cuidado.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map(s => (
                <div key={s.id} className="card-hover group overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-pink-50">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">✂</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-gray-900 mb-1">{s.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-pink-600">{formatCurrency(s.price)}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />{s.duration} min</span>
                    </div>
                    <Link to="/agendamento" className="btn-secondary w-full justify-center text-sm py-2">Agendar</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/servicos" className="btn-primary">Ver todos os serviços <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {about.photo ? (
                <img src={about.photo} alt="About" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl" />
              ) : (
                <div className="w-full aspect-[4/3] bg-pink-100 rounded-2xl flex items-center justify-center text-6xl">✨</div>
              )}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{about.yearsExperience}+ anos</p>
                  <p className="text-xs text-gray-400">de experiência</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Sobre nós</p>
              <h2 className="section-title mb-4">{about.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{about.description}</p>
              <div className="space-y-3 mb-8">
                {[
                  { label: 'Missão', text: about.mission },
                  { label: 'Visão', text: about.vision },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-600 text-xs font-bold">{item.label[0]}</span>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/sobre" className="btn-primary">Saiba mais <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {approvedTestimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-2">Depoimentos</p>
              <h2 className="section-title">O que nossas<br /><span className="gradient-text">Clientes dizem</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvedTestimonials.map(t => (
                <div key={t.id} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={16} className={i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                      {t.photo ? <img src={t.photo} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-pink-600 font-semibold text-sm">{t.clientName[0]}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.clientName}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-lash-gradient text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Pronta para transformar seu olhar?</h2>
          <p className="text-white/80 text-lg mb-8">Agende seu horário online agora e garanta o resultado que você sempre sonhou.</p>
          <Link to="/agendamento" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 font-bold rounded-xl shadow-xl hover:scale-105 transition-all duration-200 text-lg">
            Agendar Agora <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
