import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { occurrenceAPI, authAPI, userAPI } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

const statusTransitions: Record<string, string[]> = {
  aberta: ['em_execucao'],
  em_execucao: ['finalizada'],
  finalizada: [],
};

export default function OccurrenceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [occurrence, setOccurrence] = useState<Record<string, unknown> | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [resolucao, setResolucao] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resError, setResError] = useState('');
  const [assigning, setAssigning] = useState(false);

  const isNoc = user?.department === 'NOC';

  useEffect(() => {
    if (!id) return;
    Promise.all([
      occurrenceAPI.get(id as string),
      authAPI.me().catch(() => null),
      userAPI.list().catch(() => []),
    ])
      .then(([occ, u, ulist]) => {
        setOccurrence(occ);
        setUser(u);
        setUsers(ulist);
      })
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!occurrence) return;
    try {
      const updated = await occurrenceAPI.update(occurrence._id as string, { status: newStatus });
      setOccurrence(updated);
    } catch {}
  };

  const handleResolve = async () => {
    if (!occurrence || !resolucao.trim()) return;
    if (resolucao.trim().length < 10) {
      setResError('Mínimo 10 caracteres');
      return;
    }
    setResError('');
    setResolving(true);
    try {
      const updated = await occurrenceAPI.resolve(occurrence._id, resolucao);
      setOccurrence(updated);
      setResolucao('');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setResError(apiError.response?.data?.error || 'Erro ao registrar corretiva');
    } finally {
      setResolving(false);
    }
  };

  const handleAddComment = async () => {
    if (!occurrence || !comment.trim()) return;
    setSending(true);
    try {
      const updated = await occurrenceAPI.addComment(occurrence._id, comment);
      setOccurrence(updated);
      setComment('');
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir Ocorrência', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!occurrence) return;
          await occurrenceAPI.delete(occurrence._id);
          router.back();
        },
      },
    ]);
  };

  const handleAssign = async (userId: string) => {
    if (!occurrence) return;
    setAssigning(true);
    try {
      const updated = await occurrenceAPI.assign(occurrence._id, userId);
      setOccurrence(updated);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      Alert.alert('Erro', apiError.response?.data?.error || 'Erro ao atribuir');
    } finally {
      setAssigning(false);
    }
  };

  const pickAssign = () => {
    const assignedId = occurrence?.assignedTo?._id;
    const options = users
      .filter((u: Record<string, unknown>) => u._id !== assignedId)
      .map((u: Record<string, unknown>) => ({
        text: `${u.fullName} · ${u.department}`,
        onPress: () => void handleAssign(u._id),
      }));
    options.push({ text: 'Cancelar', onPress: () => {} });
    Alert.alert('Atribuir Responsável', 'Selecione um usuário:', options);
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

  if (!occurrence) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#94a3b8' }}>Ocorrência não encontrada</Text>
      </View>
    );
  }

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
  const created = occurrence.createdBy || {};
  const assigned = occurrence.assignedTo || {};
  const resolvedUser = occurrence.resolvidoPor || {};
  const transitions = statusTransitions[occurrence.status] || [];
  const isOverdue =
    occurrence.dueDate &&
    new Date(occurrence.dueDate) < new Date() &&
    occurrence.status !== 'finalizada';
  const attachments = occurrence.attachments || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: occurrence.title?.slice(0, 30) || 'Detalhe',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#f1f5f9',
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ padding: 16, gap: 16 }}>
          {/* Cabeçalho */}
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginBottom: 4 }}
                >
                  {occurrence.title}
                </Text>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}
                >
                  <PriorityBadge priority={occurrence.priority} />
                  <StatusBadge status={occurrence.status} />
                </View>
                <Text style={{ color: '#64748b', fontSize: 12 }}>
                  Criado por {created.fullName} · {created.department} · {created.cargo}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12 }}>
                  {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 22 }}>
                {occurrence.description}
              </Text>
            </View>
            {occurrence.tags?.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {occurrence.tags.map((tag: string) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: '#334155',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#cbd5e1', fontSize: 11 }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Info: Responsável + Prazo */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Responsável
              </Text>
              <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '500' }}>
                {assigned.fullName || 'Não atribuído'}
              </Text>
              {assigned.department && (
                <Text style={{ color: '#64748b', fontSize: 12 }}>{assigned.department}</Text>
              )}
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Prazo
              </Text>
              {occurrence.dueDate ? (
                <Text
                  style={{
                    color: isOverdue ? '#f87171' : '#f1f5f9',
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  {new Date(occurrence.dueDate).toLocaleDateString('pt-BR')}
                  {isOverdue && <Text style={{ color: '#f87171', fontSize: 11 }}> Atrasado</Text>}
                </Text>
              ) : (
                <Text style={{ color: '#64748b', fontSize: 14 }}>Sem prazo</Text>
              )}
            </View>
          </View>

          {/* SLA Status */}
          {occurrence.slaStatus && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                SLA
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      occurrence.slaStatus === 'dentro'
                        ? '#34d399'
                        : occurrence.slaStatus === 'atrasado'
                          ? '#fbbf24'
                          : '#f87171',
                  }}
                />
                <Text
                  style={{
                    color:
                      occurrence.slaStatus === 'dentro'
                        ? '#34d399'
                        : occurrence.slaStatus === 'atrasado'
                          ? '#fbbf24'
                          : '#f87171',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {occurrence.slaStatus === 'dentro'
                    ? 'Dentro do Prazo'
                    : occurrence.slaStatus === 'atrasado'
                      ? 'Em Atraso'
                      : 'Violado'}
                </Text>
              </View>
              {occurrence.slaBreachedAt && (
                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                  Violado em: {new Date(occurrence.slaBreachedAt).toLocaleString('pt-BR')}
                </Text>
              )}
            </View>
          )}

          {/* Aviso para não-NOC */}
          {!isNoc && occurrence.status !== 'finalizada' && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#f97316',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#f9731620',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#f97316', fontSize: 18 }}>&#8987;</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600' }}>
                    Sua ocorrência foi registrada
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                    A equipe NOC está analisando e em breve atribuirá um responsável.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Atribuição (NOC) */}
          {isNoc && occurrence.status !== 'finalizada' && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
                {assigned.fullName ? 'Reatribuir Responsável' : 'Atribuir Responsável'}
              </Text>
              <TouchableOpacity
                onPress={pickAssign}
                disabled={assigning}
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#f97316', fontWeight: '600' }}>
                  {assigning
                    ? 'Atribuindo...'
                    : assigned.fullName
                      ? 'Trocar Responsável'
                      : 'Selecionar Responsável'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Anexos */}
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Anexos
            </Text>
            {attachments.length === 0 ? (
              <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Nenhum anexo</Text>
            ) : (
              attachments.map((att: Record<string, unknown>, idx: number) => (
                <TouchableOpacity
                  key={att._id || idx}
                  onPress={() => Linking.openURL(`${API_URL}${att.fileUrl}`)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 8,
                    borderBottomWidth: idx < attachments.length - 1 ? 1 : 0,
                    borderBottomColor: '#334155',
                  }}
                >
                  <Text style={{ color: '#f97316', fontSize: 14 }}>📎</Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 13, flex: 1 }}>{att.fileName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Abrir</Text>
                </TouchableOpacity>
              ))
            )}
            {occurrence.status !== 'finalizada' && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const result = await DocumentPicker.getDocumentAsync({
                      type: '*/*',
                      copyToCacheDirectory: true,
                    });
                    if (result.canceled) return;
                    const file = result.assets[0];
                    const uploadRes = await occurrenceAPI.uploadFile(file.uri, file.name);
                    const updated = await occurrenceAPI.addAttachment(
                      occurrence._id,
                      uploadRes.fileName,
                      uploadRes.fileUrl
                    );
                    setOccurrence(updated);
                    Alert.alert('Sucesso', 'Arquivo anexado');
                  } catch (err: unknown) {
                    const apiError = err as { response?: { data?: { error?: string } } };
                    Alert.alert('Erro', apiError.response?.data?.error || 'Erro ao anexar arquivo');
                  }
                }}
                style={{
                  marginTop: 8,
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#f97316', fontWeight: '600', fontSize: 13 }}>
                  + Anexar Arquivo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Checklist (NOC) */}
          {isNoc && occurrence.checklist && occurrence.checklist.length > 0 && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
                Checklist
              </Text>
              {occurrence.checklist.map((item: Record<string, unknown>, index: number) => (
                <TouchableOpacity
                  key={item._id || index}
                  onPress={async () => {
                    try {
                      const updated = await occurrenceAPI.toggleChecklistItem(
                        occurrence._id!,
                        item._id!
                      );
                      setOccurrence(updated);
                    } catch {}
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingVertical: 8,
                    borderBottomWidth: index < occurrence.checklist.length - 1 ? 1 : 0,
                    borderBottomColor: '#334155',
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: item.done ? '#34d399' : '#64748b',
                      backgroundColor: item.done ? '#34d399' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 1,
                    }}
                  >
                    {item.done && (
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: item.done ? '#64748b' : '#f1f5f9',
                        fontSize: 14,
                        textDecorationLine: item.done ? 'line-through' : 'none',
                      }}
                    >
                      {item.text}
                    </Text>
                    {item.done && item.doneBy?.fullName && (
                      <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                        Feito por {item.doneBy.fullName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Resolução/Status (NOC) */}
          {isNoc && occurrence.status !== 'finalizada' && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
                {occurrence.status === 'aberta' ? 'Iniciar Execução' : 'Finalizar Ocorrência'}
              </Text>
              {occurrence.status === 'aberta' ? (
                <TouchableOpacity
                  onPress={() => handleStatusChange('em_execucao')}
                  style={{
                    backgroundColor: '#f97316',
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Iniciar Execução</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TextInput
                    value={resolucao}
                    onChangeText={(t) => {
                      setResolucao(t);
                      setResError('');
                    }}
                    placeholder="Descreva a ação corretiva..."
                    placeholderTextColor="#64748b"
                    multiline
                    style={{
                      backgroundColor: '#0f172a',
                      borderRadius: 12,
                      padding: 14,
                      color: '#f1f5f9',
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: '#334155',
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                  />
                  {resError ? (
                    <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{resError}</Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={handleResolve}
                    disabled={resolving || !resolucao.trim()}
                    style={{
                      backgroundColor: '#f97316',
                      borderRadius: 12,
                      padding: 14,
                      alignItems: 'center',
                      marginTop: 12,
                      opacity: resolving || !resolucao.trim() ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      {resolving ? 'Finalizando...' : 'Finalizar Ocorrência'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Resolução exibida */}
          {occurrence.resolucao && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
                Resolução / Corretivas
              </Text>
              <View
                style={{
                  backgroundColor: '#022c22',
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#065f46',
                }}
              >
                <Text style={{ color: '#d1fae5', fontSize: 14 }}>{occurrence.resolucao}</Text>
              </View>
              {resolvedUser.fullName && (
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                  Resolvido por {resolvedUser.fullName} · {resolvedUser.department}
                  {occurrence.resolvidoEm
                    ? ` em ${new Date(occurrence.resolvidoEm).toLocaleString('pt-BR')}`
                    : ''}
                </Text>
              )}
            </View>
          )}

          {/* Transições de status (NOC) */}
          {isNoc &&
            occurrence.status !== 'finalizada' &&
            transitions.length > 0 &&
            occurrence.status !== 'em_execucao' && (
              <View
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Text
                  style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 10 }}
                >
                  Alterar Status
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {transitions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => handleStatusChange(s)}
                      style={{
                        backgroundColor: '#334155',
                        borderRadius: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13 }}>
                        Mover para {s === 'em_execucao' ? 'Execução' : 'Finalizada'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                      borderRadius: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: '#7f1d1d',
                    }}
                  >
                    <Text style={{ color: '#f87171', fontWeight: '600', fontSize: 13 }}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {/* Comentários */}
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
              Comentários
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Adicionar comentário..."
                placeholderTextColor="#64748b"
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  borderRadius: 12,
                  padding: 12,
                  color: '#f1f5f9',
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={sending || !comment.trim()}
                style={{
                  backgroundColor: '#f97316',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  opacity: sending || !comment.trim() ? 0.5 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                  {sending ? '...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
            {!occurrence.comments || occurrence.comments.length === 0 ? (
              <Text style={{ color: '#64748b', textAlign: 'center', paddingVertical: 16 }}>
                Nenhum comentário ainda
              </Text>
            ) : (
              occurrence.comments.map((c: Record<string, unknown>, idx: number) => (
                <View
                  key={(c._id as string) || idx}
                  style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#f9731620',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 13 }}>
                      {(c.author?.fullName || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#e2e8f0', fontWeight: '600', fontSize: 13 }}>
                        {c.author?.fullName || 'Usuário'}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>
                        {new Date(c.createdAt).toLocaleString('pt-BR')}
                      </Text>
                    </View>
                    <Text style={{ color: '#cbd5e1', fontSize: 13, marginTop: 2 }}>{c.text}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Histórico */}
          {occurrence.history?.length > 0 && (
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
                Histórico
              </Text>
              {occurrence.history.map((entry: Record<string, unknown>, idx: number) => (
                <View
                  key={entry._id || idx}
                  style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f97316',
                      marginTop: 5,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
                      <Text style={{ fontWeight: '600' }}>
                        {entry.changedBy?.fullName || 'Sistema'}
                      </Text>
                      {' alterou '}
                      <Text style={{ color: '#f97316' }}>{entry.field}</Text>
                      {' de '}
                      <Text style={{ color: '#64748b', textDecorationLine: 'line-through' }}>
                        {entry.oldValue}
                      </Text>
                      {' para '}
                      <Text style={{ color: '#34d399' }}>{entry.newValue}</Text>
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                      {new Date(entry.changedAt).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
