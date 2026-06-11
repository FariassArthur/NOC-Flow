'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { equipmentAPI, equipmentHistoryAPI } from '@ccore/api-client';
import type { Occurrence } from '@ccore/shared';

const slaStatusConfig: Record<string, { label: string; color: string }> = {
  dentro: { label: 'Dentro', color: 'text-emerald-400 bg-emerald-500/10' },
  atrasado: { label: 'Atrasado', color: 'text-yellow-400 bg-yellow-500/10' },
  violado: { label: 'Violado', color: 'text-red-400 bg-red-500/10' },
};

export default function EquipmentDetailPage() {
  const params = useParams();
  const [equipment, setEquipment] = useState<Record<string, unknown> | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const equipmentId = params.id as string;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eq, hist, sum] = await Promise.all([
        equipmentAPI.get(equipmentId),
        equipmentHistoryAPI.list(equipmentId, { page, limit: 10 }),
        equipmentHistoryAPI.summary(equipmentId),
      ]);
      setEquipment(eq);
      setOccurrences(hist.data);
      setTotalPages(hist.totalPages);
      setSummary(sum);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipmentId) fetchData();
  }, [equipmentId, page]);

  if (loading) return <div className="text-slate-400 p-8">Carregando...</div>;
  if (!equipment) return <div className="text-slate-400 p-8">Equipamento não encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/equipment"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{equipment.name}</h1>
          <p className="text-sm text-slate-400">
            {equipment.type} {equipment.ip ? `- ${equipment.ip}` : ''}
          </p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-glow p-4">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-xs text-slate-400">Total de Ocorrências</div>
          </div>
          <div className="card-glow p-4">
            <div className="text-2xl font-bold text-emerald-400">{summary.finalizadas}</div>
            <div className="text-xs text-slate-400">Resolvidas</div>
          </div>
          <div className="card-glow p-4">
            <div className="text-2xl font-bold text-red-400">{summary.criticas}</div>
            <div className="text-xs text-slate-400">Críticas</div>
          </div>
          <div className="card-glow p-4">
            <div className="text-2xl font-bold text-orange-400">
              {summary.avgResolutionTime ? Math.round(summary.avgResolutionTime) : 0}min
            </div>
            <div className="text-xs text-slate-400">Tempo Médio</div>
          </div>
        </div>
      )}

      <div className="card-glow">
        <div className="p-4 border-b border-slate-700/30">
          <h2 className="text-white font-semibold">Histórico de Ocorrências</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {occurrences.map((occ: Occurrence) => (
            <div key={occ._id} className="p-4 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/occurrences/${occ._id}`}
                    className="text-white font-medium hover:text-accent-500 transition-colors"
                  >
                    {occ.title}
                  </Link>
                  <div className="flex gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        occ.status === 'finalizada'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : occ.status === 'em_execucao'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {occ.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        occ.priority === 'crítica'
                          ? 'bg-red-500/10 text-red-400'
                          : occ.priority === 'alta'
                            ? 'bg-orange-500/10 text-orange-400'
                            : occ.priority === 'média'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {occ.priority}
                    </span>
                    {occ.slaStatus && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium ${slaStatusConfig[occ.slaStatus]?.color || ''}`}
                      >
                        {slaStatusConfig[occ.slaStatus]?.label || occ.slaStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  {new Date(occ.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
          {occurrences.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Nenhuma ocorrência para este equipamento
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm ${page === i + 1 ? 'bg-accent-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="card-glow p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Marca:</span>
            <span className="text-white ml-2">{equipment.brand || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400">Modelo:</span>
            <span className="text-white ml-2">{equipment.equipmentModel || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400">Localização:</span>
            <span className="text-white ml-2">{equipment.location || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <span className="text-white ml-2">{equipment.status || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
