'use client';

import { useState, useEffect } from 'react';
import { templateAPI, categoryAPI, equipmentAPI, serviceAPI } from '@ccore/api-client';

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [equipment, setEquipment] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    priority: '',
    category: '',
    equipment: '',
    service: '',
    checklist: [''],
  });

  useEffect(() => {
    Promise.all([
      templateAPI
        .list()
        .then((res) => setTemplates(Array.isArray(res) ? res : []))
        .catch(() => {}),
      categoryAPI
        .list()
        .then(setCategories)
        .catch(() => {}),
      equipmentAPI
        .list()
        .then(setEquipment)
        .catch(() => {}),
      serviceAPI
        .list()
        .then(setServices)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      title: '',
      description: '',
      priority: '',
      category: '',
      equipment: '',
      service: '',
      checklist: [''],
    });
    setShowModal(true);
  };

  const openEdit = (tpl: Record<string, unknown>) => {
    setEditing(tpl);
    setForm({
      name: tpl.name || '',
      title: tpl.title || '',
      description: tpl.description || '',
      priority: tpl.priority || '',
      category: tpl.category || '',
      equipment: tpl.equipment || '',
      service: tpl.service || '',
      checklist: tpl.checklist?.length ? tpl.checklist : [''],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      checklist: form.checklist.filter((c) => c.trim()),
    };
    if (editing) {
      await templateAPI.update(editing._id, data);
    } else {
      await templateAPI.create(data);
    }
    setShowModal(false);
    const res = await templateAPI.list();
    setTemplates(Array.isArray(res) ? res : []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover template?')) return;
    await templateAPI.delete(id);
    setTemplates(templates.filter((t) => t._id !== id));
  };

  const addChecklistItem = () => setForm({ ...form, checklist: [...form.checklist, ''] });
  const removeChecklistItem = (i: number) =>
    setForm({ ...form, checklist: form.checklist.filter((_, idx) => idx !== i) });

  if (loading) return <div className="text-slate-400 p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors text-sm font-medium"
        >
          + Novo Template
        </button>
      </div>

      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Nome</th>
                <th className="text-left p-4 text-slate-400 font-medium">Título</th>
                <th className="text-left p-4 text-slate-400 font-medium">Prioridade</th>
                <th className="text-left p-4 text-slate-400 font-medium">Checklist</th>
                <th className="text-right p-4 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr
                  key={tpl._id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="p-4 text-white">{tpl.name}</td>
                  <td className="p-4 text-slate-300">{tpl.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        tpl.priority === 'crítica'
                          ? 'bg-red-500/10 text-red-400'
                          : tpl.priority === 'alta'
                            ? 'bg-orange-500/10 text-orange-400'
                            : tpl.priority === 'média'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {tpl.priority || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{tpl.checklist?.length || 0} itens</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEdit(tpl)}
                      className="text-accent-500 hover:text-accent-400 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tpl._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum template encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Editar Template' : 'Novo Template'}
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
                <label className="block text-sm text-slate-400 mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Prioridade</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                >
                  <option value="">Selecione</option>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="">Selecione</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Equipamento</label>
                  <select
                    value={form.equipment}
                    onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="">Selecione</option>
                    {equipment.map((e) => (
                      <option key={e._id} value={e.name}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Serviço</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="">Selecione</option>
                    {services.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-slate-400">Checklist</label>
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="text-xs text-accent-500 hover:text-accent-400"
                  >
                    + Adicionar item
                  </button>
                </div>
                {form.checklist.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={item}
                      onChange={(e) => {
                        const items = [...form.checklist];
                        items[i] = e.target.value;
                        setForm({ ...form, checklist: items });
                      }}
                      placeholder="Item do checklist"
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                    />
                    {form.checklist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(i)}
                        className="px-2 py-2 text-red-400 hover:text-red-300"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
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
