import React, { useEffect, useState } from 'react';
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
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
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
      const today = new Date().toISOString().slice(0, 10);
      setTodayEvents(allEvents.filter((e) => e.date === today));
    }
  };

  // Agenda notificação para eventos do dia (ao abrir a tela)
  useEffect(() => {
    if (todayEvents.length > 0) {
      todayEvents.forEach((event) => {
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
  }, [todayEvents]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Agenda de Eventos</Text>
        <Text style={styles.subtitle}>Veja os próximos eventos do sistema</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
              {item.description ? (
                <Text style={styles.eventDesc}>{item.description}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum evento cadastrado.</Text>
          }
        />
        {todayEvents.length > 0 && (
          <View style={styles.todayBox}>
            <Text style={styles.todayTitle}>Eventos de hoje:</Text>
            {todayEvents.map((ev) => (
              <Text key={ev.id} style={styles.todayEvent}>
                {ev.title}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
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
