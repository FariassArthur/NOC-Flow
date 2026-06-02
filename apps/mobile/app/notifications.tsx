import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { notificationAPI } from '../lib/api';

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  new_occurrence: { label: 'Nova', color: '#f97316', bg: '#f9731620' },
  status_change: { label: 'Status', color: '#3b82f6', bg: '#3b82f620' },
  assignment: { label: 'Atribuição', color: '#a855f7', bg: '#a855f720' },
  comment: { label: 'Comentário', color: '#34d399', bg: '#34d39920' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    const data = await notificationAPI.list();
    setNotifications(data);
  }, []);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handleMarkRead = async (id: string) => {
    await notificationAPI.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Notificações', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }} />
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>{unreadCount} não lida(s)</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={{ color: '#f97316', fontSize: 13, fontWeight: '600' }}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}>
              {notifications.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                  <Text style={{ color: '#64748b', fontSize: 15 }}>Nenhuma notificação</Text>
                </View>
              ) : (
                <View style={{ padding: 12, gap: 8 }}>
                  {notifications.map((n) => {
                    const cfg = typeConfig[n.type] || { label: n.type, color: '#64748b', bg: '#1e293b' };
                    return (
                      <TouchableOpacity
                        key={n._id}
                        onPress={() => {
                          if (!n.read) handleMarkRead(n._id);
                          if (n.relatedOccurrence) router.push(`/occurrences/${n.relatedOccurrence}`);
                        }}
                        style={{
                          backgroundColor: n.read ? '#1e293b' : '#1e293b',
                          borderRadius: 16, padding: 14, borderWidth: 1,
                          borderColor: n.read ? '#1e293b' : '#334155',
                          opacity: n.read ? 0.7 : 1,
                        }}
                      >
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cfg.bg, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: cfg.color, fontSize: 14, fontWeight: '700' }}>
                              {n.type === 'new_occurrence' ? '+' : n.type === 'status_change' ? 'S' : n.type === 'assignment' ? '@' : 'C'}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '600' }}>{cfg.label}</Text>
                              {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f97316' }} />}
                            </View>
                            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14, marginTop: 2 }} numberOfLines={1}>{n.title}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }} numberOfLines={2}>{n.message}</Text>
                            <Text style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('pt-BR')}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}
