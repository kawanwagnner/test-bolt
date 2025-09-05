import React, { useEffect, useState } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '@/src/providers/notifications/NotificationProvider';
import { Event } from '../admin/events-agenda';

const STORAGE_KEY = 'admin_events_agenda';

export default function EventsAgendaScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [eventsByDate, setEventsByDate] = useState<Record<string, Event[]>>({});
  const { schedule } = useNotification();

  useEffect(() => {
    loadEvents();
  }, []);

  // Carrega eventos e filtra os do dia
  const loadEvents = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const allEvents: Event[] = JSON.parse(data);
      setEvents(allEvents);
      // Agrupa eventos por data
      const grouped: Record<string, Event[]> = {};
      allEvents.forEach((ev) => {
        if (!grouped[ev.date]) grouped[ev.date] = [];
        grouped[ev.date].push(ev);
      });
      setEventsByDate(grouped);
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

  // Marca os dias com eventos
  const markedDates = Object.keys(eventsByDate).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: '#3B82F6',
      selected: date === selectedDate,
      selectedColor: date === selectedDate ? '#3B82F6' : undefined,
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ padding: 24 }}>
        <Text style={styles.title}>Agenda de Eventos</Text>
        <Text style={styles.subtitle}>Veja os próximos eventos do sistema</Text>
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
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.date}</Text>
                {item.description ? (
                  <Text style={styles.eventDesc}>{item.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Nenhum evento neste dia.</Text>
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
});
