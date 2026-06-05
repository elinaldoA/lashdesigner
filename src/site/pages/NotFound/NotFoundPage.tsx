import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-white text-3xl font-bold">404</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary justify-center py-3 px-6">
            Voltar ao início
          </Link>
          <Link to="/agendamento" className="btn-secondary justify-center py-3 px-6">
            Fazer agendamento
          </Link>
        </div>
      </div>
    </div>
  );
}
