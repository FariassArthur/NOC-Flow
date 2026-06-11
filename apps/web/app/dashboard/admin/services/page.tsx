'use client';

import { useState, useEffect } from 'react';
import { serviceAPI } from '@ccore/api-client';
import type { Service } from '@ccore/shared';

const types = ['internet', 'mpls', 'voip', 'vpn', 'datacenter', 'outro'] as const;
const statuses = ['ativo', 'inativo'] as const;

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'internet' as string,
    provider: '',
    contract: '',
    bandwidth: '',
    status: 'ativo' as string,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    serviceAPI
      .list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        type: form.type as any,
        provider: form.provider || undefined,
        contract: form.contract || undefined,
        bandwidth: form.bandwidth || undefined,
        status: form.status as any,
      };
      if (editing) {
        await serviceAPI.update(editing._id!, data);
      } else {
        await serviceAPI.create(data);
      }
      setForm({
        name: '',
        type: 'internet',
        provider: '',
        contract: '',
        bandwidth: '',
        status: 'ativo',
      });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Service) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      provider: item.provider || '',
      contract: item.contract || '',
      bandwidth: item.bandwidth || '',
      status: item.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este serviço?')) return;
    try {
      await serviceAPI.delete(id);
      load();
    } catch {
      /* noop */
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Serviços</h1>
      <p className="text-slate-400 text-sm">
        Gerencie serviços de rede (Internet, MPLS, VoIP, VPN, etc.)
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Novo'} Serviço</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input-field"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Provedor</label>
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contrato</label>
            <input
              type="text"
              value={form.contract}
              onChange={(e) => setForm({ ...form, contract: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Largura de Banda
            </label>
            <input
              type="text"
              value={form.bandwidth}
              onChange={(e) => setForm({ ...form, bandwidth: e.target.value })}
              className="input-field"
              placeholder="Ex: 500 Mbps"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  name: '',
                  type: 'internet',
                  provider: '',
                  contract: '',
                  bandwidth: '',
                  status: 'ativo',
                });
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50">
              <th className="text-left py-3 px-4 font-medium">Nome</th>
              <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Tipo</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Provedor</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Banda</th>
              <th className="text-center py-3 px-4 font-medium hidden sm:table-cell">Status</th>
              <th className="text-right py-3 px-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id as string}
                className="border-b border-slate-700/30 hover:bg-slate-700/20"
              >
                <td className="py-3 px-4 text-white">{item.name}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{item.type}</td>
                <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                  {item.provider || '-'}
                </td>
                <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                  {item.bandwidth || '-'}
                </td>
                <td className="py-3 px-4 text-center hidden sm:table-cell">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-accent-500 hover:text-accent-400 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item._id!)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Nenhum serviço cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
