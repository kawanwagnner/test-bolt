// Definir STORAGE_KEY para uso local
const STORAGE_KEY = 'admin_events_agenda';
import React, { useEffect, useState } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { useNotification } from '@/src/providers/notifications/NotificationProvider';
import {
  PublicEvent,
  fetchPublicEvents,
  addPublicEvent,
  updatePublicEvent,
  deletePublicEvent,
} from '@/src/features/events/publicEvents.api';
import { useAuth } from '@/src/features/auth/useAuth';
import { Button } from '@/src/components/Button';
import * as DocumentPicker from 'expo-document-picker';
import { parse } from 'papaparse';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

export default function EventsAgendaScreen() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [eventsByDate, setEventsByDate] = useState<
    Record<string, PublicEvent[]>
  >({});
  const { schedule } = useNotification();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, []);

  // Carrega eventos do Supabase e agrupa por data
  const loadEvents = async () => {
    try {
      const allEvents = await fetchPublicEvents();
      setEvents(allEvents);
      // Agrupa eventos por data
      const grouped: Record<string, PublicEvent[]> = {};
      allEvents.forEach((ev) => {
        if (!grouped[ev.date]) grouped[ev.date] = [];
        grouped[ev.date].push(ev);
      });
      setEventsByDate(grouped);
    } catch (err) {
      console.log('Erro ao carregar eventos:', err);
      // Pode exibir erro se quiser
    }
  };

  // Agenda notificação para eventos do dia selecionado
  useEffect(() => {
    const todays = eventsByDate[selectedDate] || [];
    if (todays.length > 0) {
      todays.forEach((event) => {
        const now = new Date();
        const eventDate = new Date(event.date + 'T09:00:00');
        if (eventDate > now) {
          schedule(
            eventDate,
            'Evento do dia',
            event.title,
            `event_${event.id}`
          );
        }
      });
    }
  }, [selectedDate, eventsByDate]);

  // Marca os dias com eventos e garante que o dia selecionado sempre fique marcado
  const markedDates = Object.keys(eventsByDate).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: '#3B82F6',
      selected: date === selectedDate,
      selectedColor: date === selectedDate ? '#3B82F6' : undefined,
    };
    return acc;
  }, {} as Record<string, any>);
  // Se o dia selecionado não tiver eventos, ainda assim deve ficar marcado
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: '#3B82F6',
    };
  }

  // Modal de cadastro de evento
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDesc, setNewDesc] = useState('');

  // Modal de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editEvent, setEditEvent] = useState<PublicEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDateObj, setEditDateObj] = useState<Date | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editShowDatePicker, setEditShowDatePicker] = useState(false);

  // Modal de confirmação de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<PublicEvent | null>(null);

  const handleAddEvent = () => {
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!newTitle || !dateObj) {
      alert('Preencha título e data!');
      return;
    }
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    try {
      if (!user?.id) {
        alert('Usuário não autenticado.');
        return;
      }
      await addPublicEvent({
        title: newTitle,
        date: dateStr,
        description: newDesc,
        created_by: user.id,
      });
      setModalVisible(false);
      setNewTitle('');
      setNewDate('');
      setDateObj(null);
      setNewDesc('');
      await loadEvents();
    } catch (err: any) {
      alert('Erro ao salvar evento: ' + (err?.message || JSON.stringify(err)));
    }
  };

  // Funções para editar evento
  const handleEditEvent = (event: PublicEvent) => {
    setEditEvent(event);
    setEditTitle(event.title);
    setEditDateObj(new Date(event.date));
    setEditDesc(event.description || '');
    setEditModalVisible(true);
  };

  const handleSaveEditEvent = async () => {
    if (!editEvent || !editTitle || !editDateObj) {
      alert('Preencha título e data!');
      return;
    }
    try {
      await updatePublicEvent({
        id: editEvent.id,
        title: editTitle,
        date: format(editDateObj, 'yyyy-MM-dd'),
        description: editDesc,
      });
      setEditModalVisible(false);
      setEditEvent(null);
      await loadEvents();
    } catch (err: any) {
      alert('Erro ao editar evento: ' + (err?.message || JSON.stringify(err)));
    }
  };

  // Funções para deletar evento
  const handleDeleteEvent = (event: PublicEvent) => {
    setDeleteEvent(event);
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!deleteEvent) return;
    try {
      await deletePublicEvent(deleteEvent.id);
      setDeleteModalVisible(false);
      setDeleteEvent(null);
      await loadEvents();
    } catch (err: any) {
      alert('Erro ao excluir evento: ' + (err?.message || JSON.stringify(err)));
    }
  };

  // Importa eventos via CSV para o Supabase
  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const response = await fetch(result.assets[0].uri);
      const text = await response.text();
      const parsed = parse(text, { header: true });
      if (parsed.errors && parsed.errors.length) {
        alert('Erro ao importar CSV: ' + parsed.errors[0].message);
        return;
      }
      if (!user?.id) {
        alert('Usuário não autenticado.');
        return;
      }
      const imported = (parsed.data as any[]).map((e) => ({
        title: e.title,
        date: e.date,
        description: e.description,
        created_by: user.id,
      }));
      for (const event of imported) {
        try {
          await addPublicEvent(event);
        } catch {}
      }
      await loadEvents();
      alert(`${imported.length} eventos importados!`);
    } catch (err) {
      alert('Erro ao importar CSV.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ padding: 24 }}>
        <Text style={styles.title}>Agenda de Eventos</Text>
        <Text style={styles.subtitle}>Veja os próximos eventos do sistema</Text>
        {isAdmin && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Button
              title="Setar Evento Manualmente"
              onPress={handleAddEvent}
              size="small"
            />
            <Button
              title="Importar CSV"
              onPress={handleImportCSV}
              size="small"
              variant="outline"
            />
          </View>
        )}
        {/* Modal de cadastro de evento */}
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
                  size="small"
                  variant="danger"
                />
                <Button
                  title="Salvar"
                  onPress={handleSaveEvent}
                  size="small"
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </Modal>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            todayTextColor: '#0284C7',
            selectedDayBackgroundColor: '#3B82F6',
            dotColor: '#3B82F6',
          }}
          style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}
        />
        {eventsByDate[selectedDate] && eventsByDate[selectedDate].length > 0 ? (
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Eventos em {selectedDate}:
            </Text>
            {eventsByDate[selectedDate].map((item) => (
              <View key={item.id} style={styles.card}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDate}>{item.date}</Text>
                    {item.description ? (
                      <Text style={styles.eventDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                  {isAdmin && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 8,
                      }}
                    >
                      <Pressable
                        onPress={() => handleEditEvent(item)}
                        style={{ marginRight: 12 }}
                        accessibilityLabel="Editar"
                      >
                        <MaterialIcons name="edit" size={22} color="#0284C7" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteEvent(item)}
                        accessibilityLabel="Excluir"
                      >
                        <MaterialIcons
                          name="delete"
                          size={22}
                          color="#DC2626"
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Nenhum evento neste dia.</Text>
        )}
        {/* Modal de edição de evento */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Evento</Text>
              <TextInput
                style={styles.input}
                placeholder="Título"
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <Pressable onPress={() => setEditShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    style={styles.input}
                    placeholder="Data do evento (dd/mm/yyyy)"
                    value={editDateObj ? format(editDateObj, 'dd/MM/yyyy') : ''}
                    editable={false}
                  />
                </View>
              </Pressable>
              <DateTimePickerModal
                isVisible={editShowDatePicker}
                mode="date"
                onConfirm={(date) => {
                  setEditDateObj(date);
                  setEditShowDatePicker(false);
                }}
                onCancel={() => setEditShowDatePicker(false)}
                locale="pt-BR"
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                value={editDesc}
                onChangeText={setEditDesc}
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
                  onPress={() => setEditModalVisible(false)}
                  size="small"
                  variant="danger"
                />
                <Button
                  title="Salvar"
                  onPress={handleSaveEditEvent}
                  size="small"
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de confirmação de exclusão */}
        <Modal visible={deleteModalVisible} animationType="fade" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Excluir Evento</Text>
              <Text>
                Tem certeza que deseja excluir o evento "{deleteEvent?.title}"?
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 16,
                }}
              >
                <Button
                  title="Cancelar"
                  onPress={() => setDeleteModalVisible(false)}
                  size="small"
                  variant="primary"
                />
                <Button
                  title="Excluir"
                  onPress={handleConfirmDeleteEvent}
                  size="small"
                  variant="danger"
                />
              </View>
            </View>
          </View>
        </Modal>

        {isAdmin && (
          <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 24 }}>
            O CSV deve conter colunas: id (opcional), title, date (YYYY-MM-DD),
            description (opcional)
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  eventTitle: { fontWeight: 'bold', fontSize: 18, color: '#3B82F6' },
  eventDate: { color: '#111827', fontSize: 15, marginBottom: 4 },
  eventDesc: { color: '#6B7280', fontSize: 14 },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
  todayBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  todayTitle: { fontWeight: 'bold', color: '#0284C7', marginBottom: 8 },
  todayEvent: { color: '#0369A1', fontSize: 16 },
  // Modal styles
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
});
