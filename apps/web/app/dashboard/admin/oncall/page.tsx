'use client';

import { useState, useEffect } from 'react';
import { onCallAPI, userAPI } from '@ccore/api-client';

const DAYS = [
  { value: 'dom', label: 'Dom' },
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
];

export default function OnCallAdminPage() {
  const [shifts, setShifts] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    department: 'NOC',
    weekDays: [] as string[],
    startTime: '08:00',
    endTime: '18:00',
    userIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      onCallAPI
        .list()
        .then((res) => setShifts(res.data))
        .catch(() => {}),
      userAPI
        .list()
        .then(setUsers)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      department: 'NOC',
      weekDays: [],
      startTime: '08:00',
      endTime: '18:00',
      userIds: [],
      isActive: true,
    });
    setShowModal(true);
  };

  const openEdit = (s: Record<string, unknown>) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      department: s.department,
      weekDays: s.weekDays || [],
      startTime: s.startTime,
      endTime: s.endTime,
      userIds: s.userIds || [],
      isActive: s.isActive,
    });
    setShowModal(true);
  };

  const toggleDay = (day: string) => {
    setForm({
      ...form,
      weekDays: form.weekDays.includes(day)
        ? form.weekDays.filter((d) => d !== day)
        : [...form.weekDays, day],
    });
  };

  const toggleUser = (id: string) => {
    setForm({
      ...form,
      userIds: form.userIds.includes(id)
        ? form.userIds.filter((u) => u !== id)
        : [...form.userIds, id],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await onCallAPI.update(editing._id, form as Record<string, unknown>);
    else await onCallAPI.create(form as Record<string, unknown>);
    setShowModal(false);
    const res = await onCallAPI.list();
    setShifts(res.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover plantão?')) return;
    await onCallAPI.delete(id);
    setShifts(shifts.filter((s) => s._id !== id));
  };

  if (loading) return <div className="text-slate-400 p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Escala de Plantão</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 text-sm font-medium"
        >
          + Novo Plantão
        </button>
      </div>

      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Nome</th>
                <th className="text-left p-4 text-slate-400 font-medium">Dias</th>
                <th className="text-left p-4 text-slate-400 font-medium">Horário</th>
                <th className="text-left p-4 text-slate-400 font-medium">Departamento</th>
                <th className="text-center p-4 text-slate-400 font-medium">Ativo</th>
                <th className="text-right p-4 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="p-4 text-white">{s.name}</td>
                  <td className="p-4 text-slate-400">{(s.weekDays || []).join(', ')}</td>
                  <td className="p-4 text-slate-400">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="p-4 text-slate-400">{s.department}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${s.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}
                    >
                      {s.isActive ? 'Sim' : 'Não'}
                    </span>
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
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum plantão encontrado
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
              {editing ? 'Editar Plantão' : 'Novo Plantão'}
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
              <div>
                <label className="block text-sm text-slate-400 mb-1">Departamento</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                >
                  <option value="NOC">NOC</option>
                  <option value="Suporte">Suporte</option>
                  <option value="Campo">Campo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Dias da Semana</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.weekDays.includes(day.value)
                          ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-500'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Início</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fim</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Plantinistas</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {users.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.userIds.includes(u._id)}
                        onChange={() => toggleUser(u._id)}
                        className="rounded border-slate-600"
                      />
                      {u.fullName} ({u.department})
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
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
