'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { occurrenceAPI, reportAPI } from '@ccore/api-client';
import type { Occurrence } from '@ccore/shared';
import { STATUS_OPTIONS } from '@ccore/shared';
import {
  StatusPieChart,
  PriorityBarChart,
  TimelineChart,
  SLAMetrics,
} from '../../components/DashboardCharts';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Abertas', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_execucao: {
    label: 'Em Execução',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  finalizada: {
    label: 'Finalizadas',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
};

export default function DashboardPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [slaSummary, setSlaSummary] = useState<any>(null);

  useEffect(() => {
    occurrenceAPI
      .list({ limit: 1000 })
      .then((res: any) => {
        setOccurrences(res.data || res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    reportAPI
      .summary()
      .then(setSlaSummary)
      .catch(() => {});
  }, []);

  const filtered = occurrences.filter((o) => {
    const d = new Date(o.createdAt);
    if (dateRange.from && d < new Date(dateRange.from)) return false;
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setDate(toDate.getDate() + 1);
      if (d > toDate) return false;
    }
    return true;
  });

  const stats = {
    total: filtered.length,
    aberta: filtered.filter((o) => o.status === 'aberta').length,
    em_execucao: filtered.filter((o) => o.status === 'em_execucao').length,
    finalizada: filtered.filter((o) => o.status === 'finalizada').length,
  };

  const recent = filtered.slice(0, 5);

  const byUser = filtered.reduce<Record<string, Occurrence[]>>((acc, occ) => {
    const name = (occ.createdBy as any)?.fullName || 'Desconhecido';
    if (!acc[name]) acc[name] = [];
    acc[name].push(occ);
    return acc;
  }, {});

  const exportCSV = () => {
    const headers = [
      'Título',
      'Status',
      'Prioridade',
      'Criado por',
      'Departamento',
      'Criado em',
      'Resolvido em',
      'Tempo (min)',
    ];
    const rows = filtered.map((o) => {
      const c = o.createdBy as any;
      return [
        `"${o.title}"`,
        o.status,
        o.priority,
        `"${c?.fullName || ''}"`,
        `"${c?.department || ''}"`,
        new Date(o.createdAt).toISOString(),
        o.resolvidoEm ? new Date(o.resolvidoEm).toISOString() : '',
        o.timeSpentMinutes,
      ].join(',');
    });
    const blob = new Blob([headers.join(','), '\n', rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocorrencias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Visão geral do sistema de ocorrências</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">De</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Até</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="input-field text-sm"
          />
        </div>
        {(dateRange.from || dateRange.to) && (
          <button
            onClick={() => setDateRange({ from: '', to: '' })}
            className="text-xs text-accent-500 hover:text-accent-400 mb-1"
          >
            Limpar filtro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total',
            value: stats.total,
            color: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
          },
          {
            label: 'Abertas',
            value: stats.aberta,
            color: 'bg-red-500/10 text-red-400 border-red-500/20',
          },
          {
            label: 'Em Execução',
            value: stats.em_execucao,
            color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          },
          {
            label: 'Finalizadas',
            value: stats.finalizada,
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          },
        ].map((item) => (
          <div key={item.label} className={`card-wire ${item.color}`}>
            <p className="text-sm text-slate-400 relative z-10">{item.label}</p>
            <p className="text-3xl font-bold mt-1 relative z-10">{loading ? '-' : item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusPieChart data={filtered} />
        <PriorityBarChart data={filtered} />
        <TimelineChart data={filtered} />
      </div>

      {slaSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SLAMetrics data={slaSummary} />
          <div className="card-glow">
            <h3 className="text-sm font-semibold text-white mb-4 relative z-10">
              Tempo Médio de Resolução
            </h3>
            <div className="relative z-10 flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-accent-400">
                  {slaSummary.avgResolutionTimeMinutes > 60
                    ? `${(slaSummary.avgResolutionTimeMinutes / 60).toFixed(1)}h`
                    : `${slaSummary.avgResolutionTimeMinutes} min`}
                </p>
                <p className="text-sm text-slate-400 mt-2">tempo médio para resolução</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-lg font-semibold text-white">Ocorrências Recentes</h2>
            <Link
              href="/dashboard/occurrences"
              className="text-sm text-accent-500 hover:text-accent-400"
            >
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
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                          {occ.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {created?.fullName} · {created?.department}
                        </p>
                      </div>
                      <span
                        className={`badge-status shrink-0 ${statusConfig[occ.status]?.color || ''}`}
                      >
                        {statusConfig[occ.status]?.label || occ.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-glow">
          <h2 className="text-lg font-semibold text-white mb-4 relative z-10">
            Ocorrências por Usuário
          </h2>
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
                  <div
                    key={name}
                    className="p-3 rounded-xl bg-slate-700/30 border border-slate-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-accent-500">
                            {name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{name}</p>
                          <p className="text-xs text-slate-400">
                            {user?.department} · {user?.cargo}
                          </p>
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
