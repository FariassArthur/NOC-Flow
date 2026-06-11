import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCachedToken } from '../lib/api';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setCachedToken(token);
      if (token) router.replace('/(tabs)');
      else router.replace('/auth/login');
    });
  }, []);

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
