'use client';

import { useState, useEffect } from 'react';
import { categoryAPI } from '@noc/api-client';
import type { Category } from '@noc/shared';

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => categoryAPI.list().then(setItems).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        slaResponseMinutes: form.slaResponseMinutes ? Number(form.slaResponseMinutes) : undefined,
        slaResolutionMinutes: form.slaResolutionMinutes ? Number(form.slaResolutionMinutes) : undefined,
        color: form.color,
      };
      if (editing) {
        await categoryAPI.update(editing._id!, data);
      } else {
        await categoryAPI.create(data);
      }
      setForm({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Category) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      slaResponseMinutes: item.slaResponseMinutes?.toString() || '',
      slaResolutionMinutes: item.slaResolutionMinutes?.toString() || '',
      color: item.color || '#6366f1',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta categoria?')) return;
    try { await categoryAPI.delete(id); load(); } catch {}
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Categorias</h1>
      <p className="text-slate-400 text-sm">Gerencie categorias de ocorrências e SLAs associados</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nova'} Categoria</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Cor</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-full rounded-lg bg-slate-800 border border-slate-600 cursor-pointer" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">SLA Resposta (min)</label>
            <input type="number" value={form.slaResponseMinutes} onChange={(e) => setForm({ ...form, slaResponseMinutes: e.target.value })} className="input-field" min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">SLA Resolução (min)</label>
            <input type="number" value={form.slaResolutionMinutes} onChange={(e) => setForm({ ...form, slaResolutionMinutes: e.target.value })} className="input-field" min={1} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' }); }} className="btn-secondary">Cancelar</button>}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50">
              <th className="text-left py-3 px-4 font-medium">Nome</th>
              <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Descrição</th>
              <th className="text-center py-3 px-4 font-medium hidden md:table-cell">SLA Resposta</th>
              <th className="text-center py-3 px-4 font-medium hidden md:table-cell">SLA Resolução</th>
              <th className="text-right py-3 px-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id as string} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">{item.description || '-'}</td>
                <td className="py-3 px-4 text-center text-slate-300 hidden md:table-cell">{item.slaResponseMinutes ? `${item.slaResponseMinutes} min` : '-'}</td>
                <td className="py-3 px-4 text-center text-slate-300 hidden md:table-cell">{item.slaResolutionMinutes ? `${item.slaResolutionMinutes} min` : '-'}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-accent-500 hover:text-accent-400 mr-3">Editar</button>
                  <button onClick={() => handleDelete(item._id!)} className="text-red-400 hover:text-red-300">Excluir</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Nenhuma categoria cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
