'use client';

import type { Occurrence } from '@ccore/shared';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  aberta: '#ef4444',
  em_execucao: '#f59e0b',
  finalizada: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  baixa: '#3b82f6',
  média: '#f59e0b',
  alta: '#ef4444',
  crítica: '#dc2626',
};

export function StatusPieChart({ data }: { data: Occurrence[] }) {
  const chartData = Object.entries(STATUS_COLORS)
    .map(([key, color]) => ({
      name: key === 'em_execucao' ? 'Em Execução' : key.charAt(0).toUpperCase() + key.slice(1),
      value: data.filter((o) => o.status === key).length,
      color,
    }))
    .filter((d) => d.value > 0);

  if (chartData.length === 0) return null;

  return (
    <div className="card-glow">
      <h3 className="text-sm font-semibold text-white mb-4 relative z-10">Status</h3>
      <div className="relative z-10 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke={entry.color} strokeOpacity={0.5} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-2 relative z-10">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}: <span className="text-slate-200 font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PriorityBarChart({ data }: { data: Occurrence[] }) {
  const chartData = Object.entries(PRIORITY_COLORS).map(([key, color]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: data.filter((o) => o.priority === key).length,
    color,
  }));

  if (chartData.every((d) => d.value === 0)) return null;

  return (
    <div className="card-glow">
      <h3 className="text-sm font-semibold text-white mb-4 relative z-10">Prioridade</h3>
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TimelineChart({ data }: { data: Occurrence[] }) {
  const timeline: Record<string, number> = {};
  data.forEach((occ) => {
    const date = new Date(occ.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    timeline[date] = (timeline[date] || 0) + 1;
  });

  const chartData = Object.entries(timeline)
    .map(([date, count]) => ({ date, ocorrencias: count }))
    .sort((a, b) => {
      const [dA, mA] = a.date.split('/').map(Number);
      const [dB, mB] = b.date.split('/').map(Number);
      return mA - mB || dA - dB;
    });

  if (chartData.length === 0) return null;

  return (
    <div className="card-glow">
      <h3 className="text-sm font-semibold text-white mb-4 relative z-10">
        Ocorrências ao Longo do Tempo
      </h3>
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '13px',
              }}
            />
            <Line
              type="monotone"
              dataKey="ocorrencias"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#f97316', stroke: '#1e293b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SLAMetrics({
  data,
}: {
  data: {
    slaStats: { dentro: number; atrasado: number; violado: number; semSLA: number };
    totalOccurrences: number;
  };
}) {
  const { slaStats, totalOccurrences } = data;
  const totalSLA = slaStats.dentro + slaStats.atrasado + slaStats.violado;

  const slaData = [
    {
      name: 'Dentro do SLA',
      value: slaStats.dentro,
      color: '#10b981',
      percentage: totalSLA > 0 ? Math.round((slaStats.dentro / totalSLA) * 100) : 0,
    },
    {
      name: 'Atrasado',
      value: slaStats.atrasado,
      color: '#f59e0b',
      percentage: totalSLA > 0 ? Math.round((slaStats.atrasado / totalSLA) * 100) : 0,
    },
    {
      name: 'Violado',
      value: slaStats.violado,
      color: '#ef4444',
      percentage: totalSLA > 0 ? Math.round((slaStats.violado / totalSLA) * 100) : 0,
    },
  ].filter((d) => d.value > 0);

  if (slaData.length === 0) return null;

  return (
    <div className="card-glow">
      <h3 className="text-sm font-semibold text-white mb-4 relative z-10">SLA</h3>
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={slaData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {slaData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke={entry.color} strokeOpacity={0.5} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-2 relative z-10">
        {slaData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}: <span className="text-slate-200 font-medium">{item.percentage}%</span>
          </div>
        ))}
        {slaStats.semSLA > 0 && (
          <div className="text-xs text-slate-500">({slaStats.semSLA} sem SLA)</div>
        )}
      </div>
    </div>
  );
}
