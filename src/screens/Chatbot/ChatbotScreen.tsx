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
    { id: '0', role: 'assistant', content: isLt ? 'Sveiki! Kaip galiu jums padėti?' : 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`https://www.chatbase.co/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATBASE_ID}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          chatbotId: CHATBASE_ID,
          stream: false,
          temperature: 0,
        }),
      });

      const data = await response.json();
      const reply = data.text || data.message || (isLt ? 'Atsiprašau, bandykite dar kartą.' : 'Sorry, please try again.');
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: isLt ? 'Ryšio klaida. Bandykite dar kartą.' : 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.botBubble]}>
      {item.role === 'assistant' && <Text style={s.botIcon}>🤖</Text>}
      <View style={[s.bubbleInner, item.role === 'user' ? s.userInner : s.botInner]}>
        <Text style={[s.bubbleText, item.role === 'user' ? s.userText : s.botText]}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>Root-ling Assistant</Text>
          <Text style={s.headerSub}>{isLt ? 'Visada pasiruošęs padėti' : 'Always ready to help'}</Text>
        </View>
   style={s.onlineDot} />
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
        <View style={s.typingIndicator}>
          <Text style={s.typingText}>Root-ling Assistant {isLt ? 'rašo...' : 'is typing...'}</Text>
          <ActivityIndicator size="small" color="#1FB6AE" style={{ marginLeft: 8 }} />
        </View>
      )}

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={isLt ? 'Rašykite žinutę...' : 'Type a message...'}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading}>
          <Text style={s.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, backgroor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 20, fontWeight: '600' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' },
  bubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  botBubble: { justifyContent: 'flex-start', gap: 8 },
  botIcon: { fontSize: 24, marginBottom: 4 },
  bubbleInner: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userInner: { backgroundColor: '#1FB6AE', borderBottomRightRadius: 4 },
  botInner: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#111827' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  typingText: { fontSize: 12, color: '#9CA3AF' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, backgroundColor: '#1FB6AE', borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 16 },
});
