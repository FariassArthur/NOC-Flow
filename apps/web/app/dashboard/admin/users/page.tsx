'use client';

import { useEffect, useState } from 'react';
import { userAPI, authAPI } from '@ccore/api-client';
import type { UserWithoutPassword } from '@ccore/shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    Promise.all([userAPI.list(), authAPI.me().catch(() => null)])
      .then(([userList, user]) => {
        setUsers(userList);
        setCurrentUser(user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const startEdit = (user: UserWithoutPassword) => {
    setEditId(user._id as string);
    setEditData({
      fullName: user.fullName || '',
      department: user.department || '',
      cargo: user.cargo || '',
      role: user.role || 'viewer',
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
    setError('');
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    setError('');
    try {
      const updated = await userAPI.update(editId, editData as any);
      setUsers((prev) => prev.map((u) => (u._id === editId ? updated : u)));
      setEditId(null);
      setEditData({});
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
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
      setError(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-slate-400">Acesso restrito ao departamento NOC.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Administrar Usuários</h1>
        <p className="text-slate-400 mt-1">{users.length} usuário(s) cadastrado(s)</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : (
        <div className="card-wire overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm relative z-10">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Usuário</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Departamento</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Cargo</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Função</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
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
                            <input
                              className="input-field text-sm py-1.5"
                              value={editData.department}
                              onChange={(e) =>
                                setEditData((p) => ({ ...p, department: e.target.value }))
                              }
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="input-field text-sm py-1.5"
                              value={editData.cargo}
                              onChange={(e) =>
                                setEditData((p) => ({ ...p, cargo: e.target.value }))
                              }
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
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => startEdit(user)}
                                className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                              >
                                Editar
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
      )}
    </div>
  );
}
