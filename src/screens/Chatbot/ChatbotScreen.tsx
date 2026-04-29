import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from '../../i18n';

const CHATBASE_ID = 'pxF-AFbV61GrIHhcZFj9B';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: isLt ? 'Sveiki! Kaip galiu jums padeti?' : 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://www.chatbase.co/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + CHATBASE_ID,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          chatbotId: CHATBASE_ID,
          stream: false,
          temperature: 0,
        }),
      });

      const data = await response.json();
      const reply = data.text || data.message || (isLt ? 'Atsiprašau, bandykite dar karta.' : 'Sorry, please try again.');
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: isLt ? 'Ryšio klaida. Bandykite r karta.' : 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
        {!isUser && <Text style={{ fontSize: 22, marginRight: 8, alignSelf: 'flex-end' }}>🤖</Text>}
        <View style={{
          maxWidth: '78%',
          backgroundColor: isUser ? '#1FB6AE' : '#fff',
          borderRadius: 16,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
          padding: 12,
        }}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: isUser ? '#fff' : '#111827' }}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <View sty={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Root-ling Assistant</Text>
          <Text style={s.headerSub}>{isLt ? 'Visada pasiruošes padeti' : 'Always ready to help'}</Text>
        </View>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{isLt ? 'Rašoma...' : 'Typing...'}</Text>
          <ActivityIndicator size="small" color="#1FB6AE" style={{ marginLeft: 8 }} />
        </View>
      )}

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}         onChangeText={setInput}
          placeholder={isLt ? 'Rašykite žinute...' : 'Type a message...'}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={{ width: 42, height: 42, backgroundColor: input.trim() ? '#1FB6AE' : '#E5E7EB', borderRadius: 21, justifyContent: 'center', alignItems: 'center' }}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', p: 8 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
});
