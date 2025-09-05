import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSchedules } from '@/src/features/schedules/schedules.api';
import { useAuth } from '@/src/features/auth/useAuth';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Plus, Calendar, User } from 'lucide-react-native';

export default function SchedulesScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: schedules, isLoading, refetch } = useSchedules();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderScheduleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/schedules/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card variant="elevated">
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Ativo</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        <View style={styles.scheduleInfo}>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {item.date?.split('-').reverse().join('/')}
            </Text>
          </View>

          {item.created_by_profile?.full_name && (
            <View style={styles.infoItem}>
              <User size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                por {item.created_by_profile.full_name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.notificationInfo}>
          {item.notify_24h && (
            <Text style={styles.notificationText}>• Lembrete 24h</Text>
          )}
          {item.notify_48h && (
            <Text style={styles.notificationText}>• Lembrete 48h</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escalas</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/schedules/create')}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {!schedules || schedules.length === 0 ? (
        <EmptyState
          title="Nenhuma escala criada"
          message={
            isAdmin
              ? 'Comece criando sua primeira escala para organizar as atividades.'
              : 'Ainda não há escalas disponíveis. Aguarde a criação pelo administrador.'
          }
          icon="calendar"
          action={
            isAdmin ? (
              <Button
                onPress={() => router.push('/schedules/create')}
                title="Criar primeira escala"
                variant="primary"
              />
            ) : undefined
          }
        />
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  createButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  scheduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  notificationInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  notificationText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});
