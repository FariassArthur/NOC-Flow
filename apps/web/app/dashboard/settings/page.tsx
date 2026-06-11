'use client';

import { useEffect, useState } from 'react';
import { userAPI, authAPI, departmentAPI, templateAPI } from '@ccore/api-client';
import type { UserWithoutPassword, Department, OccurrenceTemplate } from '@ccore/shared';
import { PERMISSIONS } from '@ccore/shared';
import type { PermissionKey } from '@ccore/shared';

type Tab = 'users' | 'departments' | 'templates';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('users');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI
      .me()
      .then(setCurrentUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-slate-400">Acesso restrito a administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie usuários, setores e templates do sistema</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-slate-700/50">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'users' ? 'bg-slate-800 text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Usuários
        </button>
        <button
          onClick={() => setTab('departments')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'departments' ? 'bg-slate-800 text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Setores
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'templates' ? 'bg-slate-800 text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Templates
        </button>
      </div>

      {tab === 'users' && <UsersTab currentUser={currentUser} onError={setError} />}
      {tab === 'departments' && <DepartmentsTab onError={setError} />}
      {tab === 'templates' && <TemplatesTab onError={setError} />}
    </div>
  );
}

function UsersTab({ currentUser, onError }: { currentUser: any; onError: (msg: string) => void }) {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    cargo: '',
    role: 'viewer',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [resetPwId, setResetPwId] = useState<string | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [permsUserId, setPermsUserId] = useState<string | null>(null);
  const [permsData, setPermsData] = useState<string[]>([]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([userAPI.list(), departmentAPI.list().catch(() => [])])
      .then(([userList, deptList]) => {
        setUsers(userList);
        setDepartments(deptList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      [u.fullName, u.username, u.email, u.department].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const resetCreate = () => {
    setCreateData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      department: '',
      cargo: '',
      role: 'viewer',
    });
    setShowCreate(false);
    onError('');
  };

  const handleCreate = async () => {
    if (
      !createData.username.trim() ||
      !createData.email.trim() ||
      !createData.password.trim() ||
      !createData.fullName.trim()
    ) {
      onError('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    onError('');
    try {
      const created = await userAPI.create(createData);
      setUsers((prev) => [...prev, created]);
      resetCreate();
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: UserWithoutPassword) => {
    setEditId(user._id as string);
    setEditData({
      fullName: user.fullName || '',
      department: user.department || '',
      cargo: user.cargo || '',
      role: user.role || 'viewer',
    });
    onError('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
    onError('');
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    onError('');
    try {
      const updated = await userAPI.update(editId, editData as any);
      setUsers((prev) => prev.map((u) => (u._id === editId ? updated : u)));
      setEditId(null);
      setEditData({});
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;
    try {
      await userAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  const handleResetPw = async () => {
    if (!resetPwId || !resetPwValue.trim()) {
      onError('Digite a nova senha');
      return;
    }
    setSaving(true);
    onError('');
    try {
      await userAPI.resetPassword(resetPwId, resetPwValue);
      setResetPwId(null);
      setResetPwValue('');
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao redefinir senha');
    } finally {
      setSaving(false);
    }
  };

  const openPerms = (user: UserWithoutPassword) => {
    setPermsUserId(user._id as string);
    setPermsData((user as any).permissions || []);
    onError('');
  };

  const togglePerm = (key: string) => {
    setPermsData((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const savePerms = async () => {
    if (!permsUserId) return;
    setSaving(true);
    onError('');
    try {
      const updated = await userAPI.update(permsUserId, { permissions: permsData } as any);
      setUsers((prev) => prev.map((u) => (u._id === permsUserId ? updated : u)));
      setPermsUserId(null);
      setPermsData([]);
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          className="input-field max-w-xs"
          placeholder="Buscar por nome, email, setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            resetCreate();
            setShowCreate(true);
          }}
          className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors shrink-0"
        >
          Novo Usuário
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">Novo Usuário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome completo *</label>
              <input
                className="input-field"
                value={createData.fullName}
                onChange={(e) => setCreateData((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Usuário *</label>
              <input
                className="input-field"
                value={createData.username}
                onChange={(e) => setCreateData((p) => ({ ...p, username: e.target.value }))}
                placeholder="nome.usuario"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email *</label>
              <input
                className="input-field"
                type="email"
                value={createData.email}
                onChange={(e) => setCreateData((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Senha *</label>
              <input
                className="input-field"
                type="password"
                value={createData.password}
                onChange={(e) => setCreateData((p) => ({ ...p, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Setor</label>
              <select
                className="input-field"
                value={createData.department}
                onChange={(e) => setCreateData((p) => ({ ...p, department: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Cargo</label>
              <input
                className="input-field"
                value={createData.cargo}
                onChange={(e) => setCreateData((p) => ({ ...p, cargo: e.target.value }))}
                placeholder="Ex: Analista"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Função</label>
              <select
                className="input-field"
                value={createData.role}
                onChange={(e) => setCreateData((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="viewer">Visualizador</option>
                <option value="analyst">Analista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={resetCreate}
              className="px-4 py-2 text-sm font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {saving ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </div>
      )}

      {resetPwId && (
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white">Redefinir Senha</h3>
          <input
            className="input-field"
            type="password"
            placeholder="Nova senha (mín. 5 caracteres)"
            value={resetPwValue}
            onChange={(e) => setResetPwValue(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setResetPwId(null);
                setResetPwValue('');
              }}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleResetPw}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Redefinir'}
            </button>
          </div>
        </div>
      )}

      {permsUserId && (
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white">Permissões Específicas</h3>
          <p className="text-xs text-slate-400">
            Administradores têm acesso a tudo. Conceda permissões adicionais para usuários
            não-admin.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(
              Object.entries(PERMISSIONS) as [
                PermissionKey,
                { label: string; description: string },
              ][]
            ).map(([key, perm]) => (
              <label
                key={key}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permsData.includes(key)}
                  onChange={() => togglePerm(key)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm text-white">{perm.label}</p>
                  <p className="text-xs text-slate-500">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setPermsUserId(null);
                setPermsData([]);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={savePerms}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Permissões'}
            </button>
          </div>
        </div>
      )}

      <div className="card-wire overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Usuário</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Setor</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Cargo</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Função</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isEditing = editId === user._id;
                return (
                  <tr
                    key={user._id?.toString()}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editData.fullName}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, fullName: e.target.value }))
                            }
                          />
                        </td>
                        <td className="px-4 py-2 text-slate-400">{user.username}</td>
                        <td className="px-4 py-2 text-slate-400">{user.email}</td>
                        <td className="px-4 py-2">
                          <select
                            className="input-field text-sm py-1.5"
                            value={editData.department}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, department: e.target.value }))
                            }
                          >
                            <option value="">Selecione...</option>
                            {departments.map((d) => (
                              <option key={d._id} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editData.cargo}
                            onChange={(e) => setEditData((p) => ({ ...p, cargo: e.target.value }))}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            className="input-field text-sm py-1.5"
                            value={editData.role}
                            onChange={(e) => setEditData((p) => ({ ...p, role: e.target.value }))}
                          >
                            <option value="viewer">Visualizador</option>
                            <option value="analyst">Analista</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="px-3 py-1.5 text-xs font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
                            >
                              {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-white font-medium">{user.fullName}</td>
                        <td className="px-4 py-3 text-slate-300">{user.username}</td>
                        <td className="px-4 py-3 text-slate-300">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="badge-status bg-accent-500/10 text-accent-400 border-accent-500/20">
                            {user.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{user.cargo}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {user.role === 'admin'
                            ? 'Administrador'
                            : user.role === 'analyst'
                              ? 'Analista'
                              : 'Visualizador'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <button
                              onClick={() => startEdit(user)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setResetPwId(user._id as string);
                                setResetPwValue('');
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Senha
                            </button>
                            <button
                              onClick={() => openPerms(user)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Permissões
                            </button>
                            {user._id !== currentUser?._id && (
                              <button
                                onClick={() => handleDelete(user._id as string, user.fullName)}
                                className="px-3 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DepartmentsTab({ onError }: { onError: (msg: string) => void }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = () => {
    setLoading(true);
    departmentAPI
      .list()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditId(null);
    setShowForm(false);
    onError('');
  };
  const startEdit = (dept: Department) => {
    setEditId(dept._id as string);
    setFormData({ name: dept.name, description: dept.description || '' });
    setShowForm(true);
    onError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      onError('Nome do setor é obrigatório');
      return;
    }
    setSaving(true);
    onError('');
    try {
      if (editId) {
        const updated = await departmentAPI.update(editId, formData);
        setDepartments((prev) => prev.map((d) => (d._id === editId ? updated : d)));
      } else {
        const created = await departmentAPI.create(formData);
        setDepartments((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao salvar setor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o setor "${name}"?`)) return;
    try {
      await departmentAPI.delete(id);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao excluir setor');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{departments.length} setor(es) cadastrado(s)</p>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
        >
          Novo Setor
        </button>
      </div>
      {showForm && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {editId ? 'Editar Setor' : 'Novo Setor'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome do Setor</label>
              <input
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: NOC, Suporte..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Descrição</label>
              <input
                className="input-field"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição opcional"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </div>
      )}
      <div className="card-wire overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Setor</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Descrição</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept._id?.toString()}
                  className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="badge-status bg-accent-500/10 text-accent-400 border-accent-500/20">
                      {dept.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{dept.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => startEdit(dept)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Editar
                      </button>
                      {dept.name !== 'NOC' && (
                        <button
                          onClick={() => handleDelete(dept._id as string, dept.name)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TemplatesTab({ onError }: { onError: (msg: string) => void }) {
  const [templates, setTemplates] = useState<OccurrenceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    priority: '',
    category: '',
    service: '',
    equipment: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    templateAPI
      .list()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      priority: '',
      category: '',
      service: '',
      equipment: '',
    });
    setEditId(null);
    setShowForm(false);
    onError('');
  };
  const startEdit = (t: OccurrenceTemplate) => {
    setEditId(t._id as string);
    setFormData({
      name: t.name,
      title: t.title,
      description: t.description || '',
      priority: t.priority || '',
      category: t.category || '',
      service: t.service || '',
      equipment: t.equipment || '',
    });
    setShowForm(true);
    onError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      onError('Nome e título são obrigatórios');
      return;
    }
    setSaving(true);
    onError('');
    try {
      if (editId) {
        const updated = await templateAPI.update(editId, formData);
        setTemplates((prev) => prev.map((t) => (t._id === editId ? updated : t)));
      } else {
        const created = await templateAPI.create(formData);
        setTemplates((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir template "${name}"?`)) return;
    try {
      await templateAPI.delete(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erro ao excluir template');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{templates.length} template(s) cadastrado(s)</p>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
        >
          Novo Template
        </button>
      </div>
      {showForm && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {editId ? 'Editar Template' : 'Novo Template'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome *</label>
              <input
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Link Lento"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Título *</label>
              <input
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Ocorrência de Link Lento"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Descrição</label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição padrão da ocorrência"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Prioridade</label>
              <select
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Categoria</label>
              <input
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                placeholder="Categoria padrão"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Serviço</label>
              <input
                className="input-field"
                value={formData.service}
                onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
                placeholder="Serviço padrão"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Equipamento</label>
              <input
                className="input-field"
                value={formData.equipment}
                onChange={(e) => setFormData((p) => ({ ...p, equipment: e.target.value }))}
                placeholder="Equipamento padrão"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </div>
      )}
      <div className="card-wire overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Prioridade</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr
                  key={t._id?.toString()}
                  className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-slate-300">{t.title}</td>
                  <td className="px-4 py-3">
                    <span className="badge-status bg-accent-500/10 text-accent-400 border-accent-500/20">
                      {t.priority || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => startEdit(t)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(t._id as string, t.name)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
