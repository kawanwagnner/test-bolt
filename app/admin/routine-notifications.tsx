import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '@/src/providers/notifications/NotificationProvider';

// Tipo para configuração de notificação rotineira
export type RoutineNotification = {
  id: string;
  hour: string; // '08:00'
  message: string;
};

const STORAGE_KEY = 'routine_notifications';

export default function AdminRoutineNotificationsScreen() {
  const { schedule, cancel } = useNotification();
  const [notifications, setNotifications] = useState<RoutineNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Carrega configs salvas
  const loadNotifications = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) setNotifications(JSON.parse(data));
  };

  // Salva configs
  const saveNotifications = async (list: RoutineNotification[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setNotifications(list);
  };

  // Agenda todas as notificações
  const scheduleAll = async () => {
    for (const n of notifications) {
      const [hour, minute] = n.hour.split(':').map(Number);
      const now = new Date();
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );
      if (next < now) next.setDate(next.getDate() + 1);
      await schedule(next, 'Lembrete', n.message, n.id);
    }
    Alert.alert('Notificações agendadas!');
  };

  // Cancela todas as notificações
  const cancelAll = async () => {
    for (const n of notifications) {
      await cancel(n.id);
    }
    Alert.alert('Notificações canceladas!');
  };

  // Popula AsyncStorage com notificações padrão
  const populateDefaults = async () => {
    const defaults: RoutineNotification[] = [
      {
        id: 'bom-dia',
        hour: '08:00',
        message: 'Bom dia! Confira sua escala de hoje.',
      },
      {
        id: 'fim-dia',
        hour: '18:00',
        message: 'Fim do expediente! Não esqueça de registrar seu ponto.',
      },
      {
        id: 'lembrete-semana',
        hour: '09:00',
        message: 'Lembrete semanal: revise seus compromissos.',
      },
    ];
    await saveNotifications(defaults);
    Alert.alert('Notificações padrão salvas!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações Rotineiras do Sistema</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.hour}>{item.hour}</Text>
            <Text style={styles.msg}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma notificação configurada.</Text>
        }
      />
      <View style={styles.actions}>
        <Button title="Agendar todas" onPress={scheduleAll} />
        <Button title="Cancelar todas" onPress={cancelAll} color="#EF4444" />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button
          title="Popular notificações padrão"
          onPress={populateDefaults}
          color="#3B82F6"
        />
      </View>
      <Text style={styles.info}>
        Para editar, altere o JSON salvo no AsyncStorage ou implemente um
        formulário de edição.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  hour: { fontWeight: 'bold', fontSize: 18, width: 60 },
  msg: { fontSize: 16, flex: 1 },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  info: { color: '#6B7280', fontSize: 12, marginTop: 32, textAlign: 'center' },
});
