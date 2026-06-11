'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  occurrenceAPI,
  userAPI,
  categoryAPI,
  equipmentAPI,
  serviceAPI,
  templateAPI,
} from '@ccore/api-client';

const priorities = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'média', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'crítica', label: 'Crítica' },
];

export default function NewOccurrencePage() {
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [equipment, setEquipment] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'média',
    tags: '',
    assignedTo: '',
    dueDate: '',
    category: '',
    equipment: '',
    service: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      userAPI
        .list()
        .then(setUsers)
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
      templateAPI
        .list()
        .then(setTemplates)
        .catch(() => {}),
    ]);
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const tmpl = templates.find((t) => t._id === templateId);
    if (!tmpl) return;

    const cat = categories.find((c: Record<string, unknown>) => c.name === tmpl.category);
    const eq = equipment.find((e: Record<string, unknown>) => e.name === tmpl.equipment);
    const svc = services.find((s: Record<string, unknown>) => s.name === tmpl.service);

    setForm((prev) => ({
      ...prev,
      title: tmpl.title || prev.title,
      description: tmpl.description || prev.description,
      priority: tmpl.priority || prev.priority,
      category: cat?._id || prev.category,
      equipment: eq?._id || prev.equipment,
      service: svc?._id || prev.service,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await occurrenceAPI.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        tags,
        checklist: [],
        status: 'aberta' as const,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        timeSpentMinutes: 0,
        category: form.category || undefined,
        equipment: form.equipment || undefined,
        service: form.service || undefined,
      });

      router.push(`/dashboard/occurrences/${created._id}`);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { error?: string; details?: { message?: string }[] } };
      };
      setError(
        apiError.response?.data?.error ||
          apiError.response?.data?.details?.[0]?.message ||
          'Erro ao criar ocorrência'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/occurrences"
          className="text-sm text-accent-500 hover:text-accent-400 mb-2 inline-block"
        >
          &larr; Voltar para Ocorrências
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Ocorrência</h1>
        <p className="text-slate-400 mt-1">Registre uma nova ocorrência no sistema</p>
      </div>

      {templates.length > 0 && (
        <div className="card">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Template <span className="text-slate-500">(preenche automaticamente)</span>
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="input-field"
          >
            <option value="">Sem template</option>
            {templates.map((t: Record<string, unknown>) => (
              <option key={t._id as string} value={t._id as string}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field"
            placeholder="Ex: Queda de link principal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field min-h-[120px] resize-y"
            placeholder="Descreva detalhadamente a ocorrência (mín. 10 caracteres)"
            required
            minLength={10}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="input-field"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável</label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Não atribuir</option>
              {users.map((u: Record<string, unknown>) => (
                <option key={u._id as string} value={u._id as string}>
                  {u.fullName} · {u.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Prazo <span className="text-slate-500">(opcional)</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags <span className="text-slate-500">(separadas por vírgula)</span>
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: rede, link, urgente"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Sem categoria</option>
              {categories.map((c: Record<string, unknown>) => (
                <option key={c._id as string} value={c._id as string}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Equipamento</label>
            <select
              name="equipment"
              value={form.equipment}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Sem equipamento</option>
              {equipment.map((e: Record<string, unknown>) => (
                <option key={e._id as string} value={e._id as string}>
                  {e.name} ({e.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Serviço</label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Sem serviço</option>
              {services.map((s: Record<string, unknown>) => (
                <option key={s._id as string} value={s._id as string}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Criando...' : 'Criar Ocorrência'}
          </button>
          <Link href="/dashboard/occurrences" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
