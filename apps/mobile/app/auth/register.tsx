import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../../lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', username: '', email: '', department: '', cargo: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => {
    // Prevenir entrada de NOC no campo de departamento
    if (key === 'department' && val.toUpperCase() === 'NOC') {
      setError('O setor NOC só pode ser criado por um administrador');
      return;
    }
    setError('');
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleRegister = async () => {
    const { fullName, username, email, department, cargo, password } = form;
    if (!fullName || !username || !email || !department || !cargo || !password) {
      setError('Preencha todos os campos');
      return;
    }
    
    // Validação adicional no frontend
    if (department.toUpperCase() === 'NOC') {
      setError('O setor NOC só pode ser criado por um administrador');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await authAPI.register({ ...form, role: 'viewer' });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 15, borderWidth: 1, borderColor: '#334155' };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>
            <Text style={{ color: '#f97316' }}>Projeto</Text>NOC
          </Text>
          <Text style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>Crie sua conta</Text>
        </View>

        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#fca5a5', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ backgroundColor: '#1e3a8a', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#60a5fa', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>ℹ️ Informação importante</Text>
          <Text style={{ color: '#93c5fd', fontSize: 12 }}>O setor NOC é reservado para administradores. Se você é um membro NOC, entre em contato com um administrador.</Text>
        </View>

        {[
          { key: 'fullName', label: 'Nome completo', placeholder: 'Seu nome' },
          { key: 'username', label: 'Usuário', placeholder: 'nome.usuario' },
          { key: 'email', label: 'Email', placeholder: 'seu@email.com', keyboard: 'email-address' },
          { key: 'department', label: 'Departamento/Setor', placeholder: 'Ex: Redes, Segurança, Suporte' },
          { key: 'cargo', label: 'Cargo / Função', placeholder: 'Ex: Analista, Técnico' },
        ].map(({ key, label, placeholder, keyboard }) => (
          <View key={key} style={{ marginBottom: 14 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 5, fontWeight: '500' }}>{label}</Text>
            <TextInput
              value={(form as any)[key]}
              onChangeText={set(key)}
              placeholder={placeholder}
              placeholderTextColor="#64748b"
              style={inputStyle}
              autoCapitalize={key === 'email' || key === 'username' ? 'none' : 'words'}
              keyboardType={keyboard as any}
            />
          </View>
        ))}

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 5, fontWeight: '500' }}>Senha</Text>
          <TextInput
            value={form.password}
            onChangeText={set('password')}
            placeholder="Mínimo 8 caracteres (maiúscula, minúscula, número)"
            placeholderTextColor="#64748b"
            style={inputStyle}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{ backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Cadastrar</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
