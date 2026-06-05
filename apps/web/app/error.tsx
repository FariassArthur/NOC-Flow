'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-4">Erro</h1>
        <p className="text-slate-400 mb-6">Ocorreu um erro inesperado. Tente novamente.</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
