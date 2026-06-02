'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-4xl">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            <span className="text-accent-500">Projeto</span>NOC
          </h1>
          <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full mb-4" />
          <p className="text-xl text-slate-300">
            Sistema de Gerenciamento de Ocorrências para Análise de Redes
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/25"
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-slate-700 text-slate-200 rounded-lg font-semibold hover:bg-slate-600 transition-colors border border-slate-600"
          >
            Registrar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 hover:border-accent-500/50 transition-colors">
            <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Gerenciar</h3>
            <p className="text-sm text-slate-400">Abra, acompanhe e feche ocorrências facilmente</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 hover:border-accent-500/50 transition-colors">
            <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Atribuir</h3>
            <p className="text-sm text-slate-400">Delegue tarefas e acompanhe responsáveis</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 hover:border-accent-500/50 transition-colors">
            <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Rastrear</h3>
            <p className="text-sm text-slate-400">SLA, histórico completo e comentários</p>
          </div>
        </div>
      </div>
    </div>
  );
}
