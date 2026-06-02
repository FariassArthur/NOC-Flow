'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { occurrenceAPI } from '@noc/api-client';
import type { Occurrence } from '@noc/shared';
import { StatusPieChart, PriorityBarChart, TimelineChart } from '../../components/DashboardCharts';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Abertas', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_execucao: { label: 'Em Execução', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  finalizada: { label: 'Finalizadas', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function DashboardPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    occurrenceAPI.list().then((res: any) => {
      setOccurrences(res.data || res);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: occurrences.length,
    aberta: occurrences.filter((o) => o.status === 'aberta').length,
    em_execucao: occurrences.filter((o) => o.status === 'em_execucao').length,
    finalizada: occurrences.filter((o) => o.status === 'finalizada').length,
  };

  const recent = occurrences.slice(0, 5);

  const byUser = occurrences.reduce<Record<string, Occurrence[]>>((acc, occ) => {
    const name = (occ.createdBy as any)?.fullName || 'Desconhecido';
    if (!acc[name]) acc[name] = [];
    acc[name].push(occ);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema de ocorrências</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-accent-500/10 text-accent-400 border-accent-500/20' },
          { label: 'Abertas', value: stats.aberta, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
          { label: 'Em Execução', value: stats.em_execucao, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Finalizadas', value: stats.finalizada, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        ].map((item) => (
          <div key={item.label} className={`card-wire ${item.color}`}>
            <p className="text-sm text-slate-400 relative z-10">{item.label}</p>
            <p className="text-3xl font-bold mt-1 relative z-10">{loading ? '-' : item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusPieChart data={occurrences} />
        <PriorityBarChart data={occurrences} />
        <TimelineChart data={occurrences} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-lg font-semibold text-white">Ocorrências Recentes</h2>
            <Link href="/dashboard/occurrences" className="text-sm text-accent-500 hover:text-accent-400">
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500 relative z-10">Carregando...</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 relative z-10">
              <p className="text-slate-400 mb-4">Nenhuma ocorrência encontrada</p>
              <Link href="/dashboard/occurrences/new" className="btn-primary inline-block">
                Criar Primeira Ocorrência
              </Link>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {recent.map((occ) => {
                const created = occ.createdBy as any;
                return (
                  <Link
                    key={occ._id?.toString()}
                    href={`/dashboard/occurrences/${occ._id}`}
                    className="block p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-accent-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white truncate">{occ.title}</h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{occ.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {created?.fullName} · {created?.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge-status ${statusConfig[occ.status]?.color || ''}`}>
                          {statusConfig[occ.status]?.label || occ.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-glow">
          <h2 className="text-lg font-semibold text-white mb-4 relative z-10">Ocorrências por Usuário</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-500 relative z-10">Carregando...</div>
          ) : (
            <div className="space-y-4 relative z-10">
              {Object.entries(byUser).map(([name, occs]) => {
                const user = occs[0].createdBy as any;
                const abertas = occs.filter((o) => o.status === 'aberta').length;
                const execucao = occs.filter((o) => o.status === 'em_execucao').length;
                const finalizadas = occs.filter((o) => o.status === 'finalizada').length;
                return (
                  <div key={name} className="p-3 rounded-xl bg-slate-700/30 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-accent-500">{name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{name}</p>
                          <p className="text-xs text-slate-400">{user?.department} · {user?.cargo}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">{occs.length}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-red-400">{abertas} aberta(s)</span>
                      <span className="text-amber-400">{execucao} em execução</span>
                      <span className="text-emerald-400">{finalizadas} finalizada(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
