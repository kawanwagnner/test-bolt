import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useMyAssignments } from '@/src/features/assignments/assignments.api';
import { useAuth } from '@/src/features/auth/useAuth';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { getRelativeDate, formatTime } from '@/src/utils/dates';
import { Calendar, Clock } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { data: assignments, isLoading, refetch } = useMyAssignments();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!assignments || assignments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Escalas</Text>
          <Text style={styles.subtitle}>
            Olá, {user?.profile?.full_name || 'Usuário'}!
          </Text>
        </View>

        <EmptyState
          title="Nenhuma escala agendada"
          message="Você ainda não está inscrito em nenhuma escala. Vá para a aba 'Escalas' para ver as escalas disponíveis."
          icon="calendar"
        />
      </SafeAreaView>
    );
  }

  const renderAssignmentItem = ({ item }: { item: any }) => (
    <Card variant="elevated">
      <View style={styles.assignmentHeader}>
        <Text style={styles.scheduleTitle}>{item.slot.schedule.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Inscrito</Text>
        </View>
      </View>

      <Text style={styles.slotTitle}>{item.slot.title}</Text>

      <View style={styles.timeInfo}>
        <View style={styles.timeItem}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.timeText}>
            {getRelativeDate(item.slot.schedule.date)}
          </Text>
        </View>

        {item.slot.start_time && item.slot.end_time && (
          <View style={styles.timeItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {formatTime(item.slot.start_time)} -{' '}
              {formatTime(item.slot.end_time)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Escalas</Text>
        <Text style={styles.subtitle}>
          Olá, {user?.profile?.full_name || 'Usuário'}!
        </Text>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  relativeDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  timeInfo: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
});
