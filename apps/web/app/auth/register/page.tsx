'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@ccore/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    cargo: '',
    role: 'viewer' as const,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Prevenir entrada de NOC no campo de departamento
    if (name === 'department' && value.toUpperCase() === 'NOC') {
      setError('O setor NOC só pode ser criado por um administrador');
      return;
    }

    setError('');
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação adicional no frontend
    if (form.department.toUpperCase() === 'NOC') {
      setError('O setor NOC só pode ser criado por um administrador');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white">
            CCore
          </Link>
          <p className="text-slate-400 mt-2">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">ℹ️ Informação importante</p>
            <p>
              O setor NOC é reservado para administradores. Se você é um membro NOC, entre em
              contato com um administrador.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Usuário</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="input-field"
              placeholder="nome.usuario"
              minLength={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Departamento/Setor
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: Redes, Segurança, Suporte"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Exemplos: Redes, Segurança, Suporte, Infraestrutura
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Cargo / Função
            </label>
            <input
              type="text"
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: Analista, Coordenador, Técnico"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Mínimo 8 caracteres (maiúscula, minúscula, número)"
              minLength={8}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Deve conter maiúscula, minúscula e número</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-accent-500 hover:text-accent-400">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
