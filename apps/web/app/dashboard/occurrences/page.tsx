'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { occurrenceAPI } from '@noc/api-client';
import type { Occurrence } from '@noc/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Aberta', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pausada: { label: 'Pausada', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  fechada: { label: 'Fechada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'text-blue-400' },
  média: { label: 'Média', color: 'text-amber-400' },
  alta: { label: 'Alta', color: 'text-red-400' },
  crítica: { label: 'Crítica', color: 'text-red-500 font-bold' },
};

export default function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchOccurrences = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    occurrenceAPI.list(params).then(setOccurrences).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOccurrences(); }, [statusFilter, priorityFilter]);

  const filtered = occurrences;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ocorrências</h1>
          <p className="text-slate-400 mt-1">{filtered.length} ocorrência(s)</p>
        </div>
        <Link href="/dashboard/occurrences/new" className="btn-primary">
          + Nova Ocorrência
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="">Todos os status</option>
          <option value="aberta">Aberta</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="pausada">Pausada</option>
          <option value="fechada">Fechada</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="">Todas as prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="média">Média</option>
          <option value="alta">Alta</option>
          <option value="crítica">Crítica</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">Nenhuma ocorrência encontrada</p>
          <Link href="/dashboard/occurrences/new" className="btn-primary inline-block">
            Criar Ocorrência
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((occ) => {
            const created = occ.createdBy as any;
            return (
              <Link
                key={occ._id?.toString()}
                href={`/dashboard/occurrences/${occ._id}`}
                className="block card hover:border-accent-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white truncate">{occ.title}</h3>
                      <span className={`text-xs font-medium ${priorityConfig[occ.priority]?.color || ''}`}>
                        {occ.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">{occ.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      {created?.fullName && <span>{created.fullName}</span>}
                      <span>{new Date(occ.createdAt).toLocaleDateString('pt-BR')}</span>
                      {occ.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {occ.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`badge-status shrink-0 ${statusConfig[occ.status]?.color || ''}`}>
                    {statusConfig[occ.status]?.label || occ.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
