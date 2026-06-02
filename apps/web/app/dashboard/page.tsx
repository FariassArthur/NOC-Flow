'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { occurrenceAPI } from '@noc/api-client';
import type { Occurrence } from '@noc/shared';

const statusConfig = {
  aberta: { label: 'Abertas', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pausada: { label: 'Pausadas', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  fechada: { label: 'Fechadas', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function DashboardPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    occurrenceAPI.list().then(setOccurrences).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: occurrences.length,
    aberta: occurrences.filter((o) => o.status === 'aberta').length,
    em_andamento: occurrences.filter((o) => o.status === 'em_andamento').length,
    fechada: occurrences.filter((o) => o.status === 'fechada').length,
  };

  const recent = occurrences.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-accent-500/10 text-accent-400 border-accent-500/20' },
          { label: 'Abertas', value: stats.aberta, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
          { label: 'Em Andamento', value: stats.em_andamento, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Fechadas', value: stats.fechada, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        ].map((item) => (
          <div key={item.label} className={`card border ${item.color}`}>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="text-3xl font-bold mt-1">{loading ? '-' : item.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Ocorrências Recentes</h2>
          <Link href="/dashboard/occurrences" className="text-sm text-accent-500 hover:text-accent-400">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Nenhuma ocorrência encontrada</p>
            <Link href="/dashboard/occurrences/new" className="btn-primary inline-block">
              Criar Primeira Ocorrência
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((occ) => (
              <Link
                key={occ._id?.toString()}
                href={`/dashboard/occurrences/${occ._id}`}
                className="block p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-accent-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate">{occ.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{occ.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge-status ${statusConfig[occ.status]?.color || ''}`}>
                      {statusConfig[occ.status]?.label || occ.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
