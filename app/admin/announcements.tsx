import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, Alert } from 'react-native';
import { Button } from '@/src/components/Button';
import { useCreateAnnouncement } from '@/src/features/announcements/announcements.api';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const create = useCreateAnnouncement();

  const handleSend = async () => {
    if (!title.trim()) return Alert.alert('Título obrigatório');
    try {
      // prefix will be shown in UI and notifications
      const prefixed = `COMUNICADO: ${title.trim()}`;
  await create.mutateAsync({ title: prefixed, message: message.trim() || undefined });
      Alert.alert('Enviado', 'Comunicado enviado para todos os usuários');
      setTitle('');
      setMessage('');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao enviar comunicado');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enviar Comunicado (Admin)</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Título</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Assunto do comunicado" />
        <Text style={styles.label}>Mensagem (opcional)</Text>
        <TextInput value={message} onChangeText={setMessage} style={[styles.input, { height: 120 }]} placeholder="Mensagem" multiline />
        <View style={{ marginTop: 16 }}>
          <Button onPress={handleSend} title="Enviar Comunicado" size="large" loading={create.isPending} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 16 },
  label: { fontSize: 14, color: '#374151', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
});
