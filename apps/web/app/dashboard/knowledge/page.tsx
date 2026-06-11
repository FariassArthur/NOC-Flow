'use client';

import { useState, useEffect } from 'react';
import { knowledgeAPI } from '@ccore/api-client';

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Record<string, unknown> | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    knowledgeAPI
      .list({ search, page, limit: 10 })
      .then((res) => {
        setArticles(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Base de Conhecimento</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar artigos..."
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-white text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 text-sm font-medium"
        >
          Buscar
        </button>
      </form>

      {selectedArticle ? (
        <div className="card-glow p-6 space-y-4">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </button>
          <h2 className="text-xl font-bold text-white">{selectedArticle.title}</h2>
          <div className="flex flex-wrap gap-2">
            {selectedArticle.category && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-accent-500/10 text-accent-400">
                {selectedArticle.category}
              </span>
            )}
            {(selectedArticle.tags || []).map((tag: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {selectedArticle.content}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((a) => (
            <button
              key={a._id}
              onClick={() => setSelectedArticle(a)}
              className="card-glow p-4 text-left hover:bg-slate-700/30 transition-colors w-full"
            >
              <h3 className="text-white font-medium">{a.title}</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {a.content?.substring(0, 200)}
              </p>
              <div className="flex gap-2 mt-2">
                {a.category && (
                  <span className="px-2 py-0.5 rounded text-xs bg-accent-500/10 text-accent-400">
                    {a.category}
                  </span>
                )}
                {(a.tags || []).slice(0, 3).map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {articles.length === 0 && !loading && (
            <div className="card-glow p-8 text-center text-slate-500">Nenhum artigo encontrado</div>
          )}
        </div>
      )}

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
    </div>
  );
}
