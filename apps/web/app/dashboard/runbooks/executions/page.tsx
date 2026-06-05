'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { runbookExecutionAPI } from '@noc/api-client';
import type { RunbookExecution } from '@noc/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  running: { label: 'Em Execução', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const stepStatusConfig: Record<string, string> = {
  pending: 'text-slate-500',
  in_progress: 'text-amber-400',
  completed: 'text-emerald-400',
  skipped: 'text-slate-500 line-through',
};

export default function RunbookExecutionsPage() {
  const [executions, setExecutions] = useState<RunbookExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    runbookExecutionAPI.list(params).then((res) => {
      setExecutions(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Execuções de Runbooks</h1>
          <p className="text-slate-400 mt-1">Acompanhe as execuções em andamento</p>
        </div>
        <Link href="/dashboard/runbooks" className="btn-secondary text-sm">
          Ver Runbooks
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'running', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            {s === '' ? 'Todas' : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : executions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhuma execução encontrada</div>
        ) : (
          executions.map((exec) => (
            <div key={exec._id?.toString()} className="card-glow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exec.runbookTitle}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Iniciado por {exec.startedByName || 'Desconhecido'} em{' '}
                    {new Date(exec.startedAt).toLocaleString('pt-BR')}
                  </p>
                  {exec.occurrenceId && (
                    <Link
                      href={`/dashboard/occurrences/${exec.occurrenceId}`}
                      className="text-xs text-accent-500 hover:text-accent-400 mt-1 inline-block"
                    >
                      Ver ocorrência relacionada →
                    </Link>
                  )}
                </div>
                <span className={`badge-status shrink-0 ${statusConfig[exec.status]?.color || ''}`}>
                  {statusConfig[exec.status]?.label || exec.status}
                </span>
              </div>

              <div className="space-y-2">
                {exec.steps.map((step) => (
                  <div
                    key={step.order}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      step.status === 'in_progress'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : step.status === 'completed'
                        ? 'bg-emerald-500/5 border border-emerald-500/10'
                        : 'bg-slate-700/20 border border-slate-700/20'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        step.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : step.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-400'
                          : step.status === 'skipped'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-slate-600/20 text-slate-500'
                      }`}
                    >
                      {step.status === 'completed' ? '✓' : step.order + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${stepStatusConfig[step.status] || 'text-slate-300'}`}>
                        {step.description}
                      </p>
                      {step.notes && (
                        <p className="text-xs text-slate-500 mt-1">{step.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {exec.completedAt && (
                <p className="text-xs text-slate-500 mt-4">
                  Finalizado em {new Date(exec.completedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
