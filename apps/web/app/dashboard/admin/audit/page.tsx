'use client';

import { useEffect, useState } from 'react';
import { auditAPI } from '@noc/api-client';
import type { AuditLog } from '@noc/shared';

const actionLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  register: 'Registro',
  create_occurrence: 'Criou Ocorrência',
  update_occurrence: 'Atualizou Ocorrência',
  delete_occurrence: 'Excluiu Ocorrência',
  resolve_occurrence: 'Resolveu Ocorrência',
  assign_occurrence: 'Atribuiu Ocorrência',
  add_comment: 'Adicionou Comentário',
  upload_file: 'Upload de Arquivo',
  create_user: 'Criou Usuário',
  update_user: 'Atualizou Usuário',
  delete_user: 'Excluiu Usuário',
  escalation_triggered: 'Escalonamento',
  runbook_executed: 'Runbook Executado',
};

const actionColors: Record<string, string> = {
  login: 'bg-emerald-500/10 text-emerald-400',
  logout: 'bg-slate-500/10 text-slate-400',
  register: 'bg-blue-500/10 text-blue-400',
  create_occurrence: 'bg-accent-500/10 text-accent-400',
  update_occurrence: 'bg-amber-500/10 text-amber-400',
  delete_occurrence: 'bg-red-500/10 text-red-400',
  resolve_occurrence: 'bg-green-500/10 text-green-400',
  escalation_triggered: 'bg-purple-500/10 text-purple-400',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  const fetchLogs = async (p: number) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 30 };
      if (actionFilter) params.action = actionFilter;
      const res = await auditAPI.list(params);
      setLogs(res.data);
      setTotalPages(res.totalPages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(page);
    auditAPI.stats().then(setStats).catch(() => {});
  }, [page, actionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Auditoria</h1>
        <p className="text-slate-400 mt-1">Registro de ações do sistema</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-wire border-accent-500/20 bg-accent-500/5">
            <p className="text-sm text-slate-400">Total de Logs</p>
            <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
          </div>
          {stats.actions.slice(0, 3).map((a: any) => (
            <div key={a._id} className="card-wire border-slate-700/30">
              <p className="text-sm text-slate-400">{actionLabels[a._id] || a._id}</p>
              <p className="text-2xl font-bold text-white">{a.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setActionFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!actionFilter ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700/40 text-slate-400 hover:text-slate-200'}`}
        >
          Todos
        </button>
        {Object.entries(actionLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setActionFilter(key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${actionFilter === key ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700/40 text-slate-400 hover:text-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-glow">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhum log encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Ação</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Usuário</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Detalhes</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id?.toString()} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${actionColors[log.action] || 'bg-slate-500/10 text-slate-400'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{log.userName || '-'}</div>
                      {log.userDepartment && <div className="text-xs text-slate-500">{log.userDepartment}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{log.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pb-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/40 text-slate-300 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/40 text-slate-300 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
