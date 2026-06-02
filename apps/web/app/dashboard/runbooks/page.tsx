'use client';

import { useState, useEffect } from 'react';
import { runbookAPI, categoryAPI } from '@noc/api-client';
import type { Runbook, Category } from '@noc/shared';

export default function RunbooksPage() {
  const [items, setItems] = useState<Runbook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Runbook | null>(null);
  const [viewing, setViewing] = useState<Runbook | null>(null);
  const [form, setForm] = useState({ title: '', category: '', priority: '', tags: '', steps: [{ order: 1, description: '' }] as { order: number; description: string }[] });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [r, c] = await Promise.all([runbookAPI.list(), categoryAPI.list()]);
      setItems(r);
      setCategories(c);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addStep = () => setForm({ ...form, steps: [...form.steps, { order: form.steps.length + 1, description: '' }] });
  const removeStep = (idx: number) => setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })) });
  const updateStep = (idx: number, val: string) => setForm({ ...form, steps: form.steps.map((s, i) => i === idx ? { ...s, description: val } : s) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        title: form.title,
        category: form.category || undefined,
        priority: form.priority || undefined,
        steps: form.steps.filter((s) => s.description.trim()),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await runbookAPI.update(editing._id!, data);
      } else {
        await runbookAPI.create(data);
      }
      setForm({ title: '', category: '', priority: '', tags: '', steps: [{ order: 1, description: '' }] });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleEdit = (item: Runbook) => {
    setEditing(item);
    setViewing(null);
    setForm({
      title: item.title,
      category: (item.category as any)?._id || item.category || '',
      priority: item.priority || '',
      tags: (item.tags || []).join(', '),
      steps: item.steps.length > 0 ? item.steps : [{ order: 1, description: '' }],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este runbook?')) return;
    try { await runbookAPI.delete(id); load(); } catch {}
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Runbooks / POPs</h1>
      <p className="text-slate-400 text-sm">Procedimentos operacionais padronizados para resposta a incidentes</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Novo'} Runbook</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
              <option value="">Qualquer</option>
              <option value="baixa">Baixa</option>
              <option value="média">Média</option>
              <option value="alta">Alta</option>
              <option value="crítica">Crítica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="">Geral</option>
              {categories.map((c) => <option key={c._id as string} value={c._id as string}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="Ex: bgp, link, provedor" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Passos do Procedimento</label>
            <button type="button" onClick={addStep} className="text-xs text-accent-500 hover:text-accent-400">+ Adicionar passo</button>
          </div>
          <div className="space-y-2">
            {form.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-sm text-slate-400 mt-2.5 shrink-0 w-6">#{step.order}</span>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  className="input-field flex-1 min-h-[60px] resize-y text-sm"
                  placeholder="Descreva o passo..."
                  rows={2}
                />
                {form.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-300 mt-2 shrink-0">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editing ? 'Atualizar' : 'Criar'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', category: '', priority: '', tags: '', steps: [{ order: 1, description: '' }] }); }} className="btn-secondary">Cancelar</button>}
        </div>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhum runbook cadastrado</div>
        ) : (
          items.map((item) => {
            const cat = item.category as any;
            return (
              <div key={item._id as string} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      {cat?.name && <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: cat.color + '20', color: cat.color }}>{cat.name}</span>}
                      {item.priority && <span className={`px-2 py-0.5 rounded-full text-xs ${item.priority === 'crítica' ? 'bg-red-500/10 text-red-400' : 'bg-slate-600/30 text-slate-400'}`}>{item.priority}</span>}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.map((t) => <span key={t} className="text-xs text-slate-500">#{t}</span>)}
                      </div>
                    )}
                    {viewing?._id === item._id && (
                      <div className="mt-4 space-y-2 border-t border-slate-700/30 pt-4">
                        {item.steps.map((step) => (
                          <div key={step.order} className="flex gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-500 flex items-center justify-center text-xs font-bold shrink-0">{step.order}</span>
                            <p className="text-slate-300">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setViewing(viewing?._id === item._id ? null : item)} className="text-sm text-accent-500 hover:text-accent-400">
                      {viewing?._id === item._id ? 'Ocultar' : 'Ver passos'}
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-sm text-slate-400 hover:text-slate-200">Editar</button>
                    <button onClick={() => handleDelete(item._id!)} className="text-sm text-red-400 hover:text-red-300">Excluir</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
