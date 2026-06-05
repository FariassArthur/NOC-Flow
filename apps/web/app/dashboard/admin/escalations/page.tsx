'use client';

import { useState, useEffect } from 'react';
import { escalationAPI } from '@noc/api-client';
import type { EscalationRule } from '@noc/shared';

const priorities = ['baixa', 'média', 'alta', 'crítica'];
const triggerTypes = ['sla_breach', 'time_passed'] as const;

export default function EscalationsPage() {
  const [items, setItems] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EscalationRule | null>(null);
  const [form, setForm] = useState({ name: '', priority: 'alta', triggerType: 'sla_breach' as string, triggerMinutes: '60', targetRole: '', targetDepartment: '', notifyAlso: '', active: true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => escalationAPI.list().then(setItems).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        priority: form.priority,
        triggerType: form.triggerType as any,
        triggerMinutes: Number(form.triggerMinutes),
        targetRole: form.targetRole || undefined,
        targetDepartment: form.targetDepartment || undefined,
        notifyAlso: form.notifyAlso ? form.notifyAlso.split(',').map((s) => s.trim()).filter(Boolean) : [],
        active: form.active,
      };
      if (editing) {
        await escalationAPI.update(editing._id!, data);
      } else {
        await escalationAPI.create(data);
      }
      setForm({ name: '', priority: 'alta', triggerType: 'sla_breach', triggerMinutes: '60', targetRole: '', targetDepartment: '', notifyAlso: '', active: true });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: EscalationRule) => {
    setEditing(item);
    setForm({
      name: item.name,
      priority: item.priority,
      triggerType: item.triggerType,
      triggerMinutes: item.triggerMinutes.toString(),
      targetRole: item.targetRole || '',
      targetDepartment: item.targetDepartment || '',
      notifyAlso: (item.notifyAlso || []).join(', '),
      active: item.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta regra?')) return;
    try { await escalationAPI.delete(id); load(); } catch {}
  };

  const handleToggle = async (item: EscalationRule) => {
    try { await escalationAPI.update(item._id!, { active: !item.active }); load(); } catch {}
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Regras de Escalonamento</h1>
      <p className="text-slate-400 text-sm">Configure regras para escalonamento automático de ocorrências</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nova'} Regra</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo de Gatilho</label>
            <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })} className="input-field">
              <option value="sla_breach">Violação de SLA</option>
              <option value="time_passed">Tempo Decorrido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Minutos para Gatilho</label>
            <input type="number" value={form.triggerMinutes} onChange={(e) => setForm({ ...form, triggerMinutes: e.target.value })} className="input-field" min={1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Cargo Alvo</label>
            <input type="text" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="input-field" placeholder="Ex: supervisor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Setor Alvo</label>
            <input type="text" value={form.targetDepartment} onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })} className="input-field" placeholder="Ex: NOC" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notificar também (emails)</label>
            <input type="text" value={form.notifyAlso} onChange={(e) => setForm({ ...form, notifyAlso: e.target.value })} className="input-field" placeholder="Ex: admin@email.com, supervisor@email.com" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded bg-slate-700 border-slate-500" />
          Regra ativa
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', priority: 'alta', triggerType: 'sla_breach', triggerMinutes: '60', targetRole: '', targetDepartment: '', notifyAlso: '', active: true }); }} className="btn-secondary">Cancelar</button>}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50">
              <th className="text-left py-3 px-4 font-medium">Nome</th>
              <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Prioridade</th>
              <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Gatilho</th>
              <th className="text-center py-3 px-4 font-medium hidden md:table-cell">Minutos</th>
              <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Alvo</th>
              <th className="text-center py-3 px-4 font-medium">Ativa</th>
              <th className="text-right py-3 px-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id as string} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="py-3 px-4 text-white">{item.name}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{item.priority}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{item.triggerType === 'sla_breach' ? 'SLA' : 'Tempo'}</td>
                <td className="py-3 px-4 text-center text-slate-300 hidden md:table-cell">{item.triggerMinutes} min</td>
                <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">{item.targetRole || item.targetDepartment || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleToggle(item)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-500'}`}>
                    {item.active ? 'Sim' : 'Não'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-accent-500 hover:text-accent-400 mr-3">Editar</button>
                  <button onClick={() => handleDelete(item._id!)} className="text-red-400 hover:text-red-300">Excluir</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">Nenhuma regra cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
