import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../shared/store/useStore';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useStore(s => s.login);
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    const ok = await login(data.email, data.password);
    if (ok) navigate('/admin');
    else setError('E-mail ou senha incorretos.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-pink-800">
        <div className="absolute inset-0 bg-black/20" />
        <img
          src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900"
          alt="Lash"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={20} className="text-yellow-300" />
            </div>
            <span className="font-display text-2xl font-bold">Lash Designer</span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-3 leading-tight">
            Gerencie seu<br />negócio com<br />elegância.
          </h2>
          <p className="text-white/80 text-lg">Controle total sobre agendamentos, clientes, estoque e muito mais.</p>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900">Lash Designer</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">Bem-vinda! 👋</h1>
            <p className="text-gray-500">Acesse o painel administrativo</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="label">E-mail</label>
              <input {...register('email')} type="email" className="input" placeholder="seu@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Senha</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="input pr-12" placeholder="••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
