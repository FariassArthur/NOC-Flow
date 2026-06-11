import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onUnauthorized } from '../lib/api';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onUnauthorized(() => {
      router.replace('/auth/login');
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }} />
    </>
  );
}
