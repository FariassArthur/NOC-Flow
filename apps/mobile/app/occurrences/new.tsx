import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { occurrenceAPI, userAPI, categoryAPI, equipmentAPI, serviceAPI } from '../../lib/api';

const priorities = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'média', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'crítica', label: 'Crítica' },
];

export default function NewOccurrence() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('média');
  const [tags, setTags] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedName, setAssignedName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showEquipPicker, setShowEquipPicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);

  useEffect(() => {
    Promise.all([
      userAPI.list().then(setUsers).catch(() => {}),
      categoryAPI.list().then(setCategories).catch(() => {}),
      equipmentAPI.list().then(setEquipment).catch(() => {}),
      serviceAPI.list().then(setServices).catch(() => {}),
    ]);
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) { setError('Preencha título e descrição'); return; }
    setError('');
    setLoading(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload: any = { title, description, priority, tags: tagList, status: 'aberta', timeSpentMinutes: 0 };
      if (assignedTo) payload.assignedTo = assignedTo;
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();
      if (selectedCategory) payload.category = selectedCategory;
      if (selectedEquipment) payload.equipment = selectedEquipment;
      if (selectedService) payload.service = selectedService;
      const created = await occurrenceAPI.create(payload);
      router.replace(`/occurrences/${created._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Erro ao criar');
    } finally { setLoading(false); }
  };

  const inputStyle = { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155' };

  return (
    <>
      <Stack.Screen options={{ title: 'Nova Ocorrência', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ padding: 16, gap: 16 }}>
          {error ? (
            <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Título *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Ex: Queda de link principal" placeholderTextColor="#64748b" style={inputStyle} />
          </View>

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Descrição *</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Descreva detalhadamente..." placeholderTextColor="#64748b" multiline style={[inputStyle, { minHeight: 120, textAlignVertical: 'top' }]} />
          </View>

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Prioridade</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                    backgroundColor: priority === p.value ? '#f97316' : '#1e293b',
                    borderWidth: 1, borderColor: priority === p.value ? '#f97316' : '#334155',
                  }}
                >
                  <Text style={{ color: priority === p.value ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: 13 }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Responsável</Text>
            <TouchableOpacity onPress={() => setShowUserPicker(true)} style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={{ color: assignedName ? '#f1f5f9' : '#64748b' }}>{assignedName || 'Selecionar responsável...'}</Text>
              <Text style={{ color: '#64748b' }}>▼</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Prazo <Text style={{ color: '#64748b' }}>(YYYY-MM-DD)</Text></Text>
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="Ex: 2026-06-15" placeholderTextColor="#64748b" style={inputStyle} />
          </View>

          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Tags <Text style={{ color: '#64748b' }}>(separadas por vírgula)</Text></Text>
            <TextInput value={tags} onChangeText={setTags} placeholder="Ex: rede, link, urgente" placeholderTextColor="#64748b" style={inputStyle} />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Criar Ocorrência</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showUserPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 32 }}>
          <View style={{ backgroundColor: '#1e293b', borderRadius: 16, maxHeight: 400, padding: 16 }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Selecionar Responsável</Text>
            <FlatList
              data={[{ _id: '', fullName: 'Nenhum' }, ...users]}
              keyExtractor={(item) => item._id || 'none'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setAssignedTo(item._id || '');
                    setAssignedName(item.fullName || '');
                    setShowUserPicker(false);
                  }}
                  style={{ paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#334155' }}
                >
                  <Text style={{ color: item._id === assignedTo ? '#f97316' : '#f1f5f9', fontWeight: item._id === assignedTo ? '700' : '400' }}>{item.fullName}</Text>
                  {item.department ? <Text style={{ color: '#64748b', fontSize: 12 }}>{item.department} - {item.cargo}</Text> : null}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowUserPicker(false)} style={{ marginTop: 12, alignItems: 'center', padding: 10 }}>
              <Text style={{ color: '#f97316', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
