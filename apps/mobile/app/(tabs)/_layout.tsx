import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { notificationAPI } from '../../lib/api';

function HeaderRight() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetch = () => {
      notificationAPI
        .unreadCount()
        .then((data) => setUnread(data.count ?? 0))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 8 }}>
      <TouchableOpacity
        onPress={() => router.push('/notifications')}
        style={{ padding: 8, position: 'relative' }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 20 }}>🔔</Text>
        {unread > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#f97316',
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
        <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '600' }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get('/api/auth/me')
      .then((res) => setIsAdmin(res.data.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerRight: () => <HeaderRight />,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>D</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="occurrences"
        options={{
          title: 'Ocorrências',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>O</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 13, fontWeight: 'bold' }}>R</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="runbooks"
        options={{
          title: 'Runbooks',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 13, fontWeight: 'bold' }}>B</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>P</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin === true ? '/admin' : null,
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>A</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
