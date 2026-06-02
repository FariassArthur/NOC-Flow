'use client';

import { useEffect, useState, useCallback } from 'react';
import { occurrenceAPI } from '@noc/api-client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statusColors: Record<string, string> = {
  aberta: '#f87171',
  em_execucao: '#fbbf24',
  finalizada: '#34d399',
};

const priorityColors: Record<string, string> = {
  crítica: '#dc2626',
  alta: '#f87171',
  média: '#fbbf24',
  baixa: '#60a5fa',
};

const statusCount = (list: any[], status: string) => list.filter((o: any) => o.status === status).length;
const priorityCount = (list: any[], priority: string) => list.filter((o: any) => o.priority === priority).length;

export default function ReportsPage() {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await occurrenceAPI.list() as any;
      setOccurrences(res.data || res || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = occurrences.length;
  const resolved = statusCount(occurrences, 'finalizada');
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const openUrgent = occurrences.filter((o) => o.status !== 'finalizada' && (o.priority === 'alta' || o.priority === 'crítica')).length;
  const avgResolucao = occurrences
    .filter((o: any) => o.status === 'finalizada' && o.resolvidoEm)
    .reduce((acc: number, o: any) => {
      const created = new Date(o.createdAt).getTime();
      const resolvedD = new Date(o.resolvidoEm).getTime();
      return acc + (resolvedD - created);
    }, 0);
  const avgDays = resolved > 0 ? Math.round(avgResolucao / resolved / 86400000) : 0;
  const overdue = occurrences.filter((o: any) => o.dueDate && o.status !== 'finalizada' && new Date(o.dueDate) < new Date()).length;
  const unassigned = occurrences.filter((o: any) => !o.assignedTo).length;

  const statusPieData = [
    { name: 'Abertas', value: statusCount(occurrences, 'aberta'), color: '#f87171' },
    { name: 'Em Execução', value: statusCount(occurrences, 'em_execucao'), color: '#fbbf24' },
    { name: 'Finalizadas', value: resolved, color: '#34d399' },
  ];

  const priorityBarData = [
    { name: 'Crítica', count: priorityCount(occurrences, 'crítica') },
    { name: 'Alta', count: priorityCount(occurrences, 'alta') },
    { name: 'Média', count: priorityCount(occurrences, 'média') },
    { name: 'Baixa', count: priorityCount(occurrences, 'baixa') },
  ];

  const summaryRows = [
    { label: 'Total de ocorrências', value: total },
    { label: 'Abertas', value: statusCount(occurrences, 'aberta') },
    { label: 'Em execução', value: statusCount(occurrences, 'em_execucao') },
    { label: 'Finalizadas', value: resolved },
    { label: 'Críticas pendentes', value: occurrences.filter((o: any) => o.status !== 'finalizada' && o.priority === 'crítica').length },
    { label: 'Com prazo vencido', value: overdue },
    { label: 'Sem responsável', value: unassigned },
  ];

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400 mt-1">Análise geral das ocorrências</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Taxa de Resolução', value: `${resolutionRate}%`, sub: `${resolved} de ${total}`, color: 'text-emerald-400' },
          { label: 'Abertas Urgentes', value: openUrgent, sub: 'Alta/Crítica não resolvidas', color: 'text-red-400' },
          { label: 'Tempo Médio', value: `${avgDays}d`, sub: 'Para resolução', color: 'text-amber-400' },
          { label: 'Total', value: total, sub: 'Ocorrências registradas', color: 'text-slate-300' },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-sm text-slate-300 mt-1">{kpi.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h2>
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">Sem dados</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Distribuição por Prioridade</h2>
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityBarData.map((entry) => (
                    <Cell key={entry.name} fill={priorityColors[entry.name.toLowerCase()] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">Sem dados</p>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Resumo Geral</h2>
        <div className="overflow-hidden rounded-xl border border-slate-700/30">
          <table className="w-full text-sm">
            <tbody>
              {summaryRows.map((row, i) => (
                <tr key={row.label} className={i < summaryRows.length - 1 ? 'border-b border-slate-700/20' : ''}>
                  <td className="px-4 py-3 text-slate-300">{row.label}</td>
                  <td className="px-4 py-3 text-white font-semibold text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
