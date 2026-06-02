'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { occurrenceAPI } from '@noc/api-client';
import type { Occurrence } from '@noc/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Aberta', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pausada: { label: 'Pausada', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  fechada: { label: 'Fechada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const priorityConfig: Record<string, string> = {
  baixa: 'text-blue-400',
  média: 'text-amber-400',
  alta: 'text-red-400',
  crítica: 'text-red-500 font-bold',
};

const statusTransitions: Record<string, string[]> = {
  aberta: ['em_andamento', 'pausada'],
  em_andamento: ['pausada', 'fechada'],
  pausada: ['em_andamento', 'fechada'],
  fechada: [],
};

export default function OccurrenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (params.id) {
      occurrenceAPI.get(params.id as string)
        .then(setOccurrence)
        .catch(() => router.push('/dashboard/occurrences'))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!occurrence) return;
    try {
      const updated = await occurrenceAPI.update(occurrence._id as string, { status: newStatus as any });
      setOccurrence(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurrence || !comment.trim()) return;
    setSending(true);
    try {
      const updated = await occurrenceAPI.addComment(occurrence._id as string, comment);
      setOccurrence(updated);
      setComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!occurrence || !confirm('Tem certeza que deseja excluir esta ocorrência?')) return;
    try {
      await occurrenceAPI.delete(occurrence._id as string);
      router.push('/dashboard/occurrences');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  if (!occurrence) {
    return <div className="text-center py-12 text-slate-400">Ocorrência não encontrada</div>;
  }

  const created = occurrence.createdBy as any;
  const transitions = statusTransitions[occurrence.status] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/occurrences" className="text-sm text-accent-500 hover:text-accent-400 mb-2 inline-block">
          &larr; Voltar para Ocorrências
        </Link>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white truncate">{occurrence.title}</h1>
              <span className={`text-sm font-medium ${priorityConfig[occurrence.priority] || ''}`}>
                {occurrence.priority?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Criado por {created?.fullName || 'N/A'} em {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className={`badge-status text-sm px-3 py-1 ${statusConfig[occurrence.status]?.color || ''}`}>
            {statusConfig[occurrence.status]?.label || occurrence.status}
          </span>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-200 whitespace-pre-wrap">{occurrence.description}</p>
        </div>

        {occurrence.tags?.length > 0 && (
          <div className="flex gap-2 mt-4">
            {occurrence.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {transitions.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Alterar Status</h2>
          <div className="flex gap-2 flex-wrap">
            {transitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusConfig[status]?.color || 'bg-slate-700 text-slate-300'} border ${statusConfig[status]?.color || 'border-slate-600'} hover:opacity-80`}
              >
                {statusConfig[status]?.label || status}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors ml-auto"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Comentários</h2>

        <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field flex-1"
            placeholder="Adicionar comentário..."
            required
          />
          <button type="submit" disabled={sending || !comment.trim()} className="btn-primary shrink-0">
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        {occurrence.comments?.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Nenhum comentário ainda</p>
        ) : (
          <div className="space-y-4">
            {occurrence.comments?.map((c: any, idx: number) => (
              <div key={c._id?.toString() || idx} className="flex gap-3">
                <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-accent-500">
                    {c.author?.fullName?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{c.author?.fullName || 'Usuário'}</span>
                    <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {occurrence.history?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Histórico</h2>
          <div className="space-y-3">
            {occurrence.history.map((entry: any, idx: number) => (
              <div key={entry._id?.toString() || idx} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300">
                    <span className="font-medium">{entry.changedBy?.fullName || 'Sistema'}</span>
                    {' alterou '}
                    <span className="text-accent-400">{entry.field}</span>
                    {' de '}
                    <span className="text-slate-400 line-through">{entry.oldValue}</span>
                    {' para '}
                    <span className="text-emerald-400">{entry.newValue}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(entry.changedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
