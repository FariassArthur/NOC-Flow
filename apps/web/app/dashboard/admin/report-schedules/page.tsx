'use client';

import { useState, useEffect } from 'react';
import { reportScheduleAPI } from '@ccore/api-client';

export default function ReportSchedulesAdminPage() {
  const [schedules, setSchedules] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    format: 'csv',
    filters: '',
    recipients: '',
    active: true,
  });

  useEffect(() => {
    reportScheduleAPI
      .list()
      .then((res) => setSchedules(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      frequency: 'daily',
      format: 'csv',
      filters: '',
      recipients: '',
      active: true,
    });
    setShowModal(true);
  };

  const openEdit = (s: Record<string, unknown>) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      frequency: s.frequency,
      format: s.format,
      filters: JSON.stringify(s.filters || {}),
      recipients: (s.recipients || []).join(', '),
      active: s.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      filters: form.filters ? JSON.parse(form.filters || '{}') : {},
      recipients: form.recipients
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    if (editing) await reportScheduleAPI.update(editing._id, data);
    else await reportScheduleAPI.create(data);
    setShowModal(false);
    const res = await reportScheduleAPI.list();
    setSchedules(res.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover relatório programado?')) return;
    await reportScheduleAPI.delete(id);
    setSchedules(schedules.filter((s) => s._id !== id));
  };

  const freqLabel: Record<string, string> = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
  };

  if (loading) return <div className="text-slate-400 p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Relatórios Programados</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 text-sm font-medium"
        >
          + Novo
        </button>
      </div>

      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Nome</th>
                <th className="text-left p-4 text-slate-400 font-medium">Frequência</th>
                <th className="text-left p-4 text-slate-400 font-medium">Formato</th>
                <th className="text-center p-4 text-slate-400 font-medium">Ativo</th>
                <th className="text-left p-4 text-slate-400 font-medium">Última Execução</th>
                <th className="text-right p-4 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="p-4 text-white">{s.name}</td>
                  <td className="p-4 text-slate-400">{freqLabel[s.frequency] || s.frequency}</td>
                  <td className="p-4 text-slate-400 uppercase">{s.format}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}
                    >
                      {s.active ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-accent-500 hover:text-accent-400 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum relatório programado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Editar Relatório' : 'Novo Relatório Programado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Frequência</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Formato</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Filtros (JSON)</label>
                <textarea
                  value={form.filters}
                  onChange={(e) => setForm({ ...form, filters: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Destinatários (emails separados por vírgula)
                </label>
                <input
                  value={form.recipients}
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  Ativo
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors text-sm font-medium"
                >
                  {editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
