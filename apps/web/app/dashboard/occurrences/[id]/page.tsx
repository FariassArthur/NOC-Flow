'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { occurrenceAPI, authAPI, userAPI } from '@noc/api-client';
import type { Occurrence } from '@noc/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Aberta', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  em_execucao: { label: 'Em Execução', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  finalizada: { label: 'Finalizada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const priorityConfig: Record<string, string> = {
  baixa: 'badge-status bg-blue-500/10 text-blue-400 border-blue-500/20',
  média: 'badge-status bg-amber-500/10 text-amber-400 border-amber-500/20',
  alta: 'badge-status bg-red-500/10 text-red-400 border-red-500/20',
  crítica: 'badge-status bg-red-500/10 text-red-500 border-red-500/30',
};

const statusTransitions: Record<string, string[]> = {
  aberta: ['em_execucao'],
  em_execucao: ['finalizada'],
  finalizada: [],
};

export default function OccurrenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [resolucao, setResolucao] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resError, setResError] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNoc = currentUser?.department === 'NOC';

  useEffect(() => {
    if (params.id) {
      Promise.all([
        occurrenceAPI.get(params.id as string),
        authAPI.me().catch(() => null),
        userAPI.list().catch(() => []),
      ])
        .then(([occ, user, userList]) => {
          setOccurrence(occ);
          setCurrentUser(user);
          setUsers(userList);
        })
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

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurrence || !resolucao.trim()) return;
    if (resolucao.trim().length < 10) {
      setResError('Descreva a ação corretiva (mínimo 10 caracteres)');
      return;
    }
    setResError('');
    setResolving(true);
    try {
      const updated = await occurrenceAPI.resolve(occurrence._id as string, resolucao);
      setOccurrence(updated);
      setResolucao('');
    } catch (err: any) {
      setResError(err.response?.data?.error || 'Erro ao registrar corretiva');
    } finally {
      setResolving(false);
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

  const handleAssign = async (userId: string) => {
    if (!occurrence) return;
    setAssigning(true);
    try {
      const updated = await occurrenceAPI.assign(occurrence._id as string, userId);
      setOccurrence(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !occurrence) return;
    setUploading(true);
    try {
      const uploaded = await occurrenceAPI.upload(file);
      const updated = await occurrenceAPI.addAttachment(occurrence._id as string, uploaded.fileName, uploaded.fileUrl);
      setOccurrence(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  if (!occurrence) {
    return <div className="text-center py-12 text-slate-400">Ocorrência não encontrada</div>;
  }

  const created = occurrence.createdBy as any;
  const assigned = occurrence.assignedTo as any;
  const resolvedUser = occurrence.resolvidoPor as any;
  const transitions = statusTransitions[occurrence.status] || [];
  const isOverdue = occurrence.dueDate && new Date(occurrence.dueDate) < new Date() && occurrence.status !== 'finalizada';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/occurrences" className="text-sm text-accent-500 hover:text-accent-400 mb-2 inline-block">
          &larr; Voltar para Ocorrências
        </Link>
      </div>

      <div className="card-wire">
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-white truncate">{occurrence.title}</h1>
              <span className={priorityConfig[occurrence.priority] || ''}>
                {occurrence.priority?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {created?.fullName || 'N/A'} · {created?.department || ''} · {created?.cargo || ''}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          <span className={`badge-status text-sm px-3 py-1 ${statusConfig[occurrence.status]?.color || ''}`}>
            {statusConfig[occurrence.status]?.label || occurrence.status}
          </span>
        </div>

        <div className="border-t border-slate-700/50 pt-4 relative z-10">
          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{occurrence.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 relative z-10">
          {occurrence.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {occurrence.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-slate-700/60 rounded-full text-xs text-slate-300 border border-slate-600/50">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-wire">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 relative z-10">Responsável</p>
          {assigned ? (
            <p className="text-sm text-white font-medium relative z-10">
              {assigned.fullName}
              <span className="text-slate-400 font-normal"> · {assigned.department}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400 relative z-10">Não atribuído</p>
          )}
        </div>
        <div className="card-wire">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 relative z-10">Prioridade</p>
          <p className={`text-sm font-medium relative z-10 ${priorityConfig[occurrence.priority] || 'text-slate-300'}`}>
            {occurrence.priority?.toUpperCase()}
          </p>
        </div>
        <div className="card-wire">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 relative z-10">Prazo</p>
          {occurrence.dueDate ? (
            <p className={`text-sm font-medium relative z-10 ${isOverdue ? 'text-red-400' : 'text-slate-200'}`}>
              {new Date(occurrence.dueDate).toLocaleDateString('pt-BR')}
              {isOverdue && (
                <span className="ml-2 text-xs bg-red-500/20 px-2 py-0.5 rounded-full">Atrasado</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-slate-400 relative z-10">Sem prazo definido</p>
          )}
        </div>
      </div>

      {isNoc && !occurrence.assignedTo && occurrence.status !== 'finalizada' && (
        <div className="card-wire">
          <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Atribuir Responsável</h2>
          <div className="relative z-10 flex gap-2">
            <select
              onChange={(e) => e.target.value && handleAssign(e.target.value)}
              disabled={assigning}
              className="input-field flex-1"
              defaultValue=""
            >
              <option value="" disabled>Selecione um usuário...</option>
              {users.filter((u: any) => u._id !== currentUser?._id).map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.fullName} · {u.department} · {u.cargo}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isNoc && assigned && occurrence.status !== 'finalizada' && (
        <div className="card-wire">
          <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Reatribuir</h2>
          <div className="relative z-10 flex gap-2">
            <select
              onChange={(e) => e.target.value && handleAssign(e.target.value)}
              disabled={assigning}
              className="input-field flex-1"
              defaultValue=""
            >
              <option value="" disabled>Trocar responsável...</option>
              {users.filter((u: any) => u._id !== assigned?._id).map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.fullName} · {u.department} · {u.cargo}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isNoc && occurrence.status !== 'finalizada' && (
        <div className="card-wire">
          <h2 className="text-lg font-semibold text-white mb-3 relative z-10">
            {occurrence.status === 'aberta' ? 'Iniciar Execução' : 'Finalizar Ocorrência'}
          </h2>

          {occurrence.status === 'em_execucao' && (
            <form onSubmit={handleResolve} className="space-y-3 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Ação Corretiva
                </label>
                <textarea
                  value={resolucao}
                  onChange={(e) => { setResolucao(e.target.value); setResError(''); }}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Descreva detalhadamente as ações realizadas para solucionar esta ocorrência..."
                  rows={4}
                />
                {resError && (
                  <p className="text-xs text-red-400 mt-1">{resError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={resolving || !resolucao.trim()}
                  className="btn-primary"
                >
                  {resolving ? 'Finalizando...' : 'Finalizar Ocorrência'}
                </button>
              </div>
            </form>
          )}

          {occurrence.status === 'aberta' && (
            <div className="relative z-10">
              <button
                onClick={() => handleStatusChange('em_execucao')}
                className="btn-primary"
              >
                Iniciar Execução
              </button>
              <p className="text-xs text-slate-500 mt-2">
                Ao iniciar a execução, a ocorrência será movida para "Em Execução"
              </p>
            </div>
          )}
        </div>
      )}

      {occurrence.resolucao && (
        <div className="card-glow">
          <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Resolução / Corretivas</h2>
          <div className="relative z-10 space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{occurrence.resolucao}</p>
            </div>
            {resolvedUser && (
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolvido por {resolvedUser.fullName} · {resolvedUser.department}
                {occurrence.resolvidoEm && ` em ${new Date(occurrence.resolvidoEm).toLocaleString('pt-BR')}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="card-wire">
        <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Anexos</h2>
        <div className="relative z-10 space-y-3">
          {occurrence.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {occurrence.attachments.map((att: any, idx: number) => (
                <a
                  key={att._id || idx}
                  href={`${process.env.NEXT_PUBLIC_API_URL || ''}${att.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-accent-400 border border-slate-600/30 hover:border-accent-500/30 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {att.fileName}
                </a>
              ))}
            </div>
          )}
          {occurrence.status !== 'finalizada' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm"
              >
                {uploading ? 'Enviando...' : '+ Adicionar Anexo'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isNoc && transitions.length > 0 && occurrence.status !== 'em_execucao' && (
        <div className="card-wire">
          <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Alterar Status</h2>
          <div className="flex gap-2 flex-wrap relative z-10">
            {transitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusConfig[status]?.color || 'bg-slate-700 text-slate-300'} border ${statusConfig[status]?.color?.split(' ')[2] || 'border-slate-600'} hover:opacity-80 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)]`}
              >
                Mover para {statusConfig[status]?.label || status}
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

      <div className="card-wire">
        <h2 className="text-lg font-semibold text-white mb-4 relative z-10">Comentários</h2>

        <form onSubmit={handleAddComment} className="flex gap-3 mb-6 relative z-10">
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
          <p className="text-slate-500 text-center py-4 relative z-10">Nenhum comentário ainda</p>
        ) : (
          <div className="space-y-4 relative z-10">
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
        <div className="card-glow">
          <h2 className="text-lg font-semibold text-white mb-4 relative z-10">Histórico</h2>
          <div className="space-y-3 relative z-10">
            {occurrence.history.map((entry: any, idx: number) => (
              <div key={entry._id?.toString() || idx} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
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
