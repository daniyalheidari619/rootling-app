import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function ChatScreen({ route, navigation }: any) {
  const { taskId, otherUser } = route.params;
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', taskId],
    queryFn: async () => {
      const { data } = await client.get(`/api/messages/task/${taskId}`);
      return data.messages || [];
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (messages.length) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await client.post('/api/messages/send', { taskId, receiverId: otherUser.id, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', taskId] });
      setMessage('');
    },
  });

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?.id;
    const mins = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
    const timeAgo = mins < 1 ? 'now' : mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h`;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>{item.content}</Text>
          <Text style={[styles.timeText, !isMe && { color: '#9CA3AF' }]}>{timeAgo}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.name || 'Chat'}</Text>
          <Text style={styles.headerSub}>Task conversation</Text>
        </View>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color="#1FB6AE" /></View>
      ) : (
        <FlatList ref={flatListRef} data={messages} keyExtractor={(item) => item.id} renderItem={renderMessage} contentContainerStyle={styles.messageList} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} />
      )}
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Type a message..." placeholderTextColor="#9CA3AF" multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={() => { if (message.trim()) sendMutation.mutate(message.trim()); }} disabled={sendMutation.isPending}>
          {sendMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendText}>→</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#1FB6AE' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280' },
  messageList: { padding: 16 },
  msgRow: { marginBottom: 8 },
  msgRowMe: { alignItems: 'flex-end' },
  msgRowThem: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  bubbleMe: { backgroundColor: '#1FB6AE', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: '#111827' },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 100, backgroundColor: '#F9FAFB' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
