import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-2xl font-bold">!</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Algo deu errado</h1>
          <p className="text-gray-500 mb-6">Ocorreu um erro inesperado. Recarregue a página para continuar.</p>
          <details className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <summary className="text-xs font-semibold text-red-700 cursor-pointer">Detalhes do erro</summary>
            <code className="text-xs text-red-600 break-all mt-2 block">{this.state.error.message}</code>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full justify-center text-base py-3"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
