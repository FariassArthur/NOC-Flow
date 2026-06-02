'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { occurrenceAPI } from '@noc/api-client';

const priorities = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'média', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'crítica', label: 'Crítica' },
];

export default function NewOccurrencePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'média',
    tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        priority: form.priority as any,
        tags,
      });

      router.push(`/dashboard/occurrences/${created._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Erro ao criar ocorrência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/occurrences" className="text-sm text-accent-500 hover:text-accent-400 mb-2 inline-block">
          &larr; Voltar para Ocorrências
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Ocorrência</h1>
        <p className="text-slate-400 mt-1">Registre uma nova ocorrência no sistema</p>
      </div>

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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input-field"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
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
