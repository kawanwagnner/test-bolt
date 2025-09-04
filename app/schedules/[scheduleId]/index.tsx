import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useScheduleById } from '@/features/schedules/schedules.api';
import { useSlotsBySchedule } from '@/features/slots/slots.api';
import { useAssignToSlot, useUnassignFromSlot } from '@/features/assignments/assignments.api';
import { useAuth } from '@/features/auth/useAuth';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SlotItem } from '@/components/SlotItem';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/utils/dates';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Settings, Plus, Calendar, FileText } from 'lucide-react-native';

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>();
  const { user, isAdmin } = useAuth();
  
  const { data: schedule, isLoading: scheduleLoading } = useScheduleById(scheduleId!);
  const { data: slots, isLoading: slotsLoading, refetch } = useSlotsBySchedule(scheduleId!);
  
  const assignToSlot = useAssignToSlot();
  const unassignFromSlot = useUnassignFromSlot();
  
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null);
  const [unassigningAssignmentId, setUnassigningAssignmentId] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    if (!scheduleId) return;

    const channel = supabase
      .channel('realtime:schedule')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'slots', filter: `schedule_id=eq.${scheduleId}` },
          () => refetch()
      )
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'assignments' },
          () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scheduleId, refetch]);

  const handleAssignToSlot = async (slotId: string) => {
    if (!user) return;

    setAssigningSlotId(slotId);
    try {
      await assignToSlot.mutateAsync({
        slot_id: slotId,
        user_id: user.id,
      });
      Alert.alert('Sucesso!', 'Você foi inscrito no slot com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível se inscrever');
    } finally {
      setAssigningSlotId(null);
    }
  };

  const handleUnassignFromSlot = (assignmentId: string) => {
    Alert.alert(
      'Confirmar Cancelamento',
      'Tem certeza que deseja cancelar sua inscrição?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          style: 'destructive',
          onPress: async () => {
            setUnassigningAssignmentId(assignmentId);
            try {
              await unassignFromSlot.mutateAsync(assignmentId);
              Alert.alert('Sucesso!', 'Inscrição cancelada com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível cancelar');
            } finally {
              setUnassigningAssignmentId(null);
            }
          }
        },
      ]
    );
  };

  if (scheduleLoading || slotsLoading) {
    return <LoadingSpinner />;
  }

  if (!schedule) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Escala não encontrada"
          message="Esta escala pode ter sido removida ou você não tem permissão para visualizá-la."
        />
      </SafeAreaView>
    );
  }

  const renderSlotItem = ({ item }: { item: any }) => {
    const userAssignment = item.assignments.find((a: any) => a.user.id === user?.id);
    const isAssigned = !!userAssignment;
    const canAssign = !isAssigned && item.available_spots > 0 && 
                     (item.mode === 'livre' || isAdmin);
    const canUnassign = isAssigned;
    const canManage = isAdmin;

    return (
      <SlotItem
        slot={item}
        canAssign={canAssign}
        canUnassign={canUnassign}
        canManage={canManage}
        isAssigned={isAssigned}
        loading={assigningSlotId === item.id || unassigningAssignmentId === userAssignment?.id}
        onAssign={() => handleAssignToSlot(item.id)}
        onUnassign={() => userAssignment && handleUnassignFromSlot(userAssignment.id)}
        onManage={() => router.push(`/schedules/${scheduleId}/manage?slotId=${item.id}`)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {schedule.title}
        </Text>
        {isAdmin && (
          <TouchableOpacity 
            onPress={() => router.push(`/schedules/${scheduleId}/manage`)}
            style={styles.manageButton}
          >
            <Settings size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.scheduleInfo}>
          <View style={styles.scheduleHeader}>
            <Calendar size={24} color="#3B82F6" strokeWidth={2} />
            <View style={styles.scheduleDetails}>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              <Text style={styles.scheduleDate}>
                {formatDate(schedule.date, 'EEEE, dd MMMM yyyy')}
              </Text>
            </View>
          </View>

          {schedule.description && (
            <View style={styles.descriptionContainer}>
              <FileText size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.description}>{schedule.description}</Text>
            </View>
          )}

          <View style={styles.notificationInfo}>
            {schedule.notify_24h && (
              <Text style={styles.notificationText}>• Lembrete 24h</Text>
            )}
            {schedule.notify_48h && (
              <Text style={styles.notificationText}>• Lembrete 48h (Professores)</Text>
            )}
          </View>
        </Card>

        {!slots || slots.length === 0 ? (
          <EmptyState
            title="Nenhum slot disponível"
            message={isAdmin ? 
              "Adicione slots para que os membros possam se inscrever." :
              "Esta escala ainda não possui slots disponíveis."
            }
            icon="clock"
            action={isAdmin ? (
              <Button
                onPress={() => router.push(`/schedules/${scheduleId}/manage`)}
                title="Adicionar Slots"
                variant="primary"
              />
            ) : undefined}
          />
        ) : (
          <FlatList
            data={slots}
            renderItem={renderSlotItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={slotsLoading} onRefresh={refetch} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {isAdmin && (
        <View style={styles.adminActions}>
          <Button
            onPress={() => router.push(`/schedules/${scheduleId}/manage`)}
            title="Gerenciar Slots"
            variant="primary"
            size="large"
          />
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  manageButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scheduleInfo: {
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  scheduleDate: {
    fontSize: 16,
    color: '#6B7280',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  adminActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});