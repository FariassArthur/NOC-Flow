import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI, userAPI } from '../../lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    department: '',
    cargo: '',
    avatar: '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    authAPI
      .me()
      .then((u) => {
        setUser(u);
        setForm({
          fullName: u.fullName || '',
          email: u.email || '',
          department: u.department || '',
          cargo: u.cargo || '',
          avatar: u.avatar || '',
        });
      })
      .catch((err) => {
        if (err.response?.status === 401) router.replace('/auth/login');
        else setError('Erro ao carregar perfil');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const updated = await userAPI.updateProfile(form);
      setUser(updated);
      Alert.alert('Sucesso', 'Perfil atualizado');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    setError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('Senhas não conferem');
      return;
    }
    if (pwForm.newPassword.length < 5) {
      setError('Nova senha deve ter pelo menos 5 caracteres');
      return;
    }
    setChangingPassword(true);
    try {
      await userAPI.updatePassword(pwForm.currentPassword, pwForm.newPassword);
      Alert.alert('Sucesso', 'Senha alterada');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 20 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        {/* Profile info header */}
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#f97316',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>
            {user?.fullName}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            {user?.department} · {user?.cargo}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>@{user?.username}</Text>
        </View>

        {/* Edit Profile */}
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#334155',
            gap: 14,
          }}
        >
          <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>
            Informações Pessoais
          </Text>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Nome completo
            </Text>
            <TextInput
              value={form.fullName}
              onChangeText={(v) => setForm({ ...form, fullName: v })}
              style={inputStyle}
            />
          </View>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Email
            </Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              keyboardType="email-address"
              style={inputStyle}
            />
          </View>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Setor
            </Text>
            <TextInput
              value={form.department}
              onChangeText={(v) => setForm({ ...form, department: v })}
              style={inputStyle}
            />
          </View>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Cargo
            </Text>
            <TextInput
              value={form.cargo}
              onChangeText={(v) => setForm({ ...form, cargo: v })}
              style={inputStyle}
            />
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Salvar Alterações
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password */}
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#334155',
            gap: 14,
          }}
        >
          <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>Alterar Senha</Text>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Senha atual
            </Text>
            <TextInput
              value={pwForm.currentPassword}
              onChangeText={(v) => setPwForm({ ...pwForm, currentPassword: v })}
              secureTextEntry
              style={inputStyle}
            />
          </View>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Nova senha
            </Text>
            <TextInput
              value={pwForm.newPassword}
              onChangeText={(v) => setPwForm({ ...pwForm, newPassword: v })}
              secureTextEntry
              style={inputStyle}
            />
          </View>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
              Confirmar nova senha
            </Text>
            <TextInput
              value={pwForm.confirmPassword}
              onChangeText={(v) => setPwForm({ ...pwForm, confirmPassword: v })}
              secureTextEntry
              style={inputStyle}
            />
          </View>
          <TouchableOpacity
            onPress={handlePassword}
            disabled={changingPassword}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
              opacity: changingPassword ? 0.5 : 1,
            }}
          >
            {changingPassword ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Alterar Senha</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
