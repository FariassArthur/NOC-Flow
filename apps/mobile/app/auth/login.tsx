import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { authAPI } from '../../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) { setError('Preencha todos os campos'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.login(login, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
          <Text style={{ color: '#f97316' }}>Projeto</Text>NOC
        </Text>
        <Text style={{ color: '#94a3b8', marginTop: 8, fontSize: 15 }}>Faça login para continuar</Text>
      </View>

      {error ? (
        <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#fca5a5', fontSize: 14 }}>{error}</Text>
        </View>
      ) : null}

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 6, fontWeight: '500' }}>Usuário ou Email</Text>
        <TextInput
          value={login}
          onChangeText={setLogin}
          placeholder="nome.usuario"
          placeholderTextColor="#64748b"
          style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 15, borderWidth: 1, borderColor: '#334155' }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 6, fontWeight: '500' }}>Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Sua senha"
          placeholderTextColor="#64748b"
          style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 15, borderWidth: 1, borderColor: '#334155' }}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', opacity: loading ? 0.5 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={{ color: '#94a3b8', fontSize: 14 }}>Não tem conta? </Text>
        <Link href="/auth/register" style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>Cadastre-se</Link>
      </View>
    </KeyboardAvoidingView>
  );
}
