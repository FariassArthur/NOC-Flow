'use client';

import { useState, useEffect } from 'react';
import { knowledgeAPI } from '@ccore/api-client';

export default function KnowledgeAdminPage() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    relatedEquipmentTypes: '',
    published: true,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await knowledgeAPI.list({ search, page, limit: 20 });
      setArticles(res.data);
      setTotalPages(res.totalPages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      content: '',
      category: '',
      tags: '',
      relatedEquipmentTypes: '',
      published: true,
    });
    setShowModal(true);
  };

  const openEdit = (a: Record<string, unknown>) => {
    setEditing(a);
    setForm({
      title: a.title,
      content: a.content,
      category: a.category || '',
      tags: (a.tags || []).join(', '),
      relatedEquipmentTypes: (a.relatedEquipmentTypes || []).join(', '),
      published: a.published,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      relatedEquipmentTypes: form.relatedEquipmentTypes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editing) await knowledgeAPI.update(editing._id, data);
    else await knowledgeAPI.create(data);
    setShowModal(false);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover artigo?')) return;
    await knowledgeAPI.delete(id);
    setArticles(articles.filter((a) => a._id !== id));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Base de Conhecimento</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 text-sm font-medium"
        >
          + Novo Artigo
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar artigos..."
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-white text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 text-sm"
        >
          Buscar
        </button>
      </form>

      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Título</th>
                <th className="text-left p-4 text-slate-400 font-medium">Categoria</th>
                <th className="text-left p-4 text-slate-400 font-medium">Tags</th>
                <th className="text-center p-4 text-slate-400 font-medium">Publicado</th>
                <th className="text-right p-4 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr
                  key={a._id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="p-4 text-white max-w-xs truncate">{a.title}</td>
                  <td className="p-4 text-slate-400">{a.category || '-'}</td>
                  <td className="p-4 text-slate-400">{(a.tags || []).join(', ')}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${a.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}
                    >
                      {a.published ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-accent-500 hover:text-accent-400 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum artigo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm ${page === i + 1 ? 'bg-accent-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Editar Artigo' : 'Novo Artigo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm text-slate-400 mb-1">Conteúdo *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Publicado</label>
                  <select
                    value={form.published.toString()}
                    onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Tipos de Equipamento Relacionados
                </label>
                <input
                  value={form.relatedEquipmentTypes}
                  onChange={(e) => setForm({ ...form, relatedEquipmentTypes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
                />
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
