'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-3">Algo deu errado</h2>
        <p className="text-slate-400 mb-6">Não foi possível carregar esta página.</p>
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
