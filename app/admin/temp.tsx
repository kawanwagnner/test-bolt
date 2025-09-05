import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parse } from 'papaparse';

export type Event = {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  description?: string;
};

const STORAGE_KEY = 'admin_events_agenda';

import { useNotification } from '@/src/providers/notifications/NotificationProvider';

export default function AdminEventsAgendaScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const { schedule } = useNotification();

  useEffect(() => {
    loadEvents();
  }, []);

  const styles = StyleSheet.create({
    modalBg: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 24,
      width: '90%',
      elevation: 4,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: '#F3F4F6',
    },
    container: { flex: 1, padding: 24, backgroundColor: '#F9FAFB' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 12,
      elevation: 1,
    },
    eventTitle: { fontWeight: 'bold', fontSize: 18 },
    eventDate: { color: '#3B82F6', fontSize: 15 },
    eventDesc: { color: '#6B7280', fontSize: 14 },
    removeBtn: { color: '#EF4444', fontWeight: 'bold', marginLeft: 16 },
    empty: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    info: {
      color: '#6B7280',
      fontSize: 12,
      marginTop: 32,
      textAlign: 'center',
    },
  });
  const loadEvents = async () => {
    const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedEvents) return;
    setEvents(JSON.parse(storedEvents));
  };

  const saveEvents = async (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
  };

  const handleAddEvent = () => {
    if (!newTitle || !dateObj) {
      Alert.alert('Preencha título e data!');
      return;
    }
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const newEvent: Event = {
      id: Math.random().toString(36).slice(2),
      title: newTitle,
      date: dateStr,
      description: newDesc,
    };
    saveEvents([...events, newEvent]);
    setModalVisible(false);
    setNewTitle('');
    setNewDate('');
    setDateObj(null);
    setNewDesc('');
  };

  const removeEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveEvents(updated);
  };

  const importCSV = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const response = await fetch(result.assets[0].uri);
    const text = await response.text();
    const parsed = parse(text, { header: true });
    if (parsed.errors && parsed.errors.length) {
      Alert.alert('Erro ao importar CSV', parsed.errors[0].message);
      return;
    }
    const imported = (parsed.data as any[]).map((e) => ({
      ...e,
      id: e.id || Math.random().toString(36).slice(2),
    }));
    saveEvents([...events, ...imported]);
    Alert.alert(
      'Importação concluída!',
      `${imported.length} eventos importados.`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda de Eventos (Admin)</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
              {item.description ? (
                <Text style={styles.eventDesc}>{item.description}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => removeEvent(item.id)}>
              <Text style={styles.removeBtn}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum evento cadastrado.</Text>
        }
      />
      <View style={styles.actions}>
        <Button title="Importar CSV" onPress={importCSV} />
        <Button
          title="Adicionar Evento"
          onPress={() => setModalVisible(true)}
          color="#3B82F6"
        />
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <Pressable onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <TextInput
                  style={styles.input}
                  placeholder="Data do evento (dd/mm/yyyy)"
                  value={dateObj ? format(dateObj, 'dd/MM/yyyy') : ''}
                  editable={false}
                />
              </View>
            </Pressable>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={(date) => {
                setDateObj(date);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
              locale="pt-BR"
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição (opcional)"
              value={newDesc}
              onChangeText={setNewDesc}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color="#EF4444"
              />
              <Button title="Salvar" onPress={handleAddEvent} color="#22C55E" />
            </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.info}>
        O CSV deve conter colunas: id (opcional), title, date (YYYY-MM-DD),
        description (opcional)
      </Text>
    </View>
  );
}
