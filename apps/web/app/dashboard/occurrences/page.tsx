'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { occurrenceAPI } from '@ccore/api-client';
import type { Occurrence, PaginatedResponse } from '@ccore/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Aberta', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_execucao: {
    label: 'Em Execução',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  finalizada: {
    label: 'Finalizada',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOccurrences = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (search) params.search = search;

    occurrenceAPI
      .list(params)
      .then((res) => {
        const data = res as any;
        if (data.data) {
          setOccurrences(data.data);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        } else {
          setOccurrences(data);
          setTotal(data.length);
          setTotalPages(1);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter, search, page]);

  useEffect(() => {
    fetchOccurrences();
  }, [fetchOccurrences]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ocorrências</h1>
          <p className="text-slate-400 mt-1">{total} ocorrência(s)</p>
        </div>
        <Link href="/dashboard/occurrences/new" className="btn-primary">
          + Nova Ocorrência
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por título, descrição ou tags..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setPage(1);
            }}
            className="btn-secondary shrink-0"
          >
            Limpar
          </button>
        )}
      </form>

      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="">Todos os status</option>
          <option value="aberta">Aberta</option>
          <option value="em_execucao">Em Execução</option>
          <option value="finalizada">Finalizada</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
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
      ) : occurrences.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">Nenhuma ocorrência encontrada</p>
          <Link href="/dashboard/occurrences/new" className="btn-primary inline-block">
            Criar Ocorrência
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {occurrences.map((occ) => {
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
                        <span
                          className={`text-xs font-medium ${priorityConfig[occ.priority]?.color || ''}`}
                        >
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
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 5;
                if (totalPages <= maxVisible + 2) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);
                  if (start > 2) pages.push('...');
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < totalPages - 1) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${idx}`} className="text-slate-500 px-1">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        p === page
                          ? 'bg-accent-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                          : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
