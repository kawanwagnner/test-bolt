import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../admin/events-agenda';

const STORAGE_KEY = 'admin_events_agenda';

export default function EventsListScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      setEvents(JSON.parse(data));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        contentContainerStyle={styles.container}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
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
});
