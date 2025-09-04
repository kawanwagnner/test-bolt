import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Switch,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useScheduleById } from '@/src/features/schedules/schedules.api';
import {
  useSlotsBySchedule,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
} from '@/src/features/slots/slots.api';
import { useThemes } from '@/src/features/themes/themes.api';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { slotSchema, SlotInput } from '@/src/utils/validation';
import {
  ArrowLeft,
  Plus,
  CreditCard as Edit3,
  Trash2,
  Clock,
  Users,
  Settings,
} from 'lucide-react-native';

export default function ManageScheduleScreen() {
  const router = useRouter();
  const { scheduleId, slotId } = useLocalSearchParams<{
    scheduleId: string;
    slotId?: string;
  }>();

  const { data: schedule } = useScheduleById(scheduleId!);
  const { data: slots, isLoading, refetch } = useSlotsBySchedule(scheduleId!);
  const { data: themes } = useThemes();

  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();
  const deleteSlot = useDeleteSlot();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SlotInput>({
    // @ts-ignore
    resolver: zodResolver(slotSchema),
    defaultValues: {
      mode: 'livre',
      capacity: 1,
    },
  });

  const openModal = (slot?: any) => {
    setEditingSlot(slot);
    if (slot) {
      reset({
        title: slot.title || '',
        description: slot.description || '',
        theme_id: slot.theme_id || '',
        start_time: slot.start_time ? slot.start_time.slice(11, 16) : '',
        end_time: slot.end_time ? slot.end_time.slice(11, 16) : '',
        mode: slot.mode,
        capacity: slot.capacity,
      });
    } else {
      reset({
        title: '',
        description: '',
        theme_id: '',
        start_time: '',
        end_time: '',
        mode: 'livre',
        capacity: 1,
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSlot(null);
  };

  const onSubmit = async (data: SlotInput) => {
    try {
      const slotData = {
        ...data,
        schedule_id: scheduleId!,
        start_time: data.start_time
          ? `${schedule?.date}T${data.start_time}:00`
          : null,
        end_time: data.end_time
          ? `${schedule?.date}T${data.end_time}:00`
          : null,
        theme_id: data.theme_id || null,
      };

      if (editingSlot) {
        await updateSlot.mutateAsync({ id: editingSlot.id, ...slotData });
        Alert.alert('Sucesso!', 'Slot atualizado com sucesso.');
      } else {
        await createSlot.mutateAsync(slotData);
        Alert.alert('Sucesso!', 'Slot criado com sucesso.');
      }

      closeModal();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Operação não realizada');
    }
  };

  const handleDeleteSlot = (slot: any) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o slot "${slot.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSlot.mutateAsync(slot.id);
              Alert.alert('Sucesso!', 'Slot excluído com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderSlotItem = ({ item }: { item: any }) => (
    <Card variant="elevated">
      <View style={styles.slotHeader}>
        <Text style={styles.slotTitle}>{item.title || 'Slot sem título'}</Text>
        <View style={styles.slotActions}>
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={styles.actionButton}
          >
            <Edit3 size={18} color="#3B82F6" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteSlot(item)}
            style={styles.actionButton}
          >
            <Trash2 size={18} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {item.description && (
        <Text style={styles.slotDescription}>{item.description}</Text>
      )}

      <View style={styles.slotDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.start_time && item.end_time
              ? `${item.start_time.slice(11, 16)} - ${item.end_time.slice(
                  11,
                  16
                )}`
              : 'Horário não definido'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.assignments.length}/{item.capacity} inscritos
          </Text>
        </View>

        <View style={styles.modeIndicator}>
          <Text
            style={[
              styles.modeText,
              {
                color: item.mode === 'manual' ? '#F59E0B' : '#10B981',
              },
            ]}
          >
            {item.mode === 'manual' ? 'Modo Manual' : 'Inscrição Livre'}
          </Text>
        </View>
      </View>

      {item.assignments.length > 0 && (
        <View style={styles.assignmentsList}>
          <Text style={styles.assignmentsLabel}>Inscritos:</Text>
          {item.assignments.map((assignment: any) => (
            <Text key={assignment.id} style={styles.assignmentUser}>
              • {assignment.user.full_name}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Gerenciar Slots
        </Text>
        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!slots || slots.length === 0 ? (
          <EmptyState
            title="Nenhum slot criado"
            message="Adicione slots para que os membros possam se inscrever."
            icon="clock"
            action={
              <Button
                onPress={() => openModal()}
                title="Criar primeiro slot"
                variant="primary"
              />
            }
          />
        ) : (
          <FlatList
            data={slots}
            renderItem={renderSlotItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSlot ? 'Editar Slot' : 'Novo Slot'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Card variant="elevated">
              <View style={styles.formHeader}>
                <Settings size={24} color="#3B82F6" strokeWidth={2} />
                <Text style={styles.formTitle}>Informações do Slot</Text>
              </View>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Título"
                    placeholder="Ex: Apresentação do projeto"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Descrição (opcional)"
                    placeholder="Descreva o slot..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                    multiline
                    numberOfLines={2}
                    style={{ height: 60, textAlignVertical: 'top' }}
                  />
                )}
              />

              <View style={styles.timeRow}>
                <Controller
                  control={control}
                  name="start_time"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.timeInput}>
                      <Input
                        label="Início"
                        placeholder="09:00"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.start_time?.message}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="end_time"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.timeInput}>
                      <Input
                        label="Fim"
                        placeholder="10:00"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.end_time?.message}
                      />
                    </View>
                  )}
                />
              </View>

              <Controller
                control={control}
                name="capacity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Capacidade"
                    placeholder="1"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseInt(text, 10) || 1)}
                    onBlur={onBlur}
                    error={errors.capacity?.message}
                    keyboardType="numeric"
                  />
                )}
              />

              <Controller
                control={control}
                name="mode"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.switchContainer}>
                    <View style={styles.switchInfo}>
                      <Text style={styles.switchLabel}>Modo de Inscrição</Text>
                      <Text style={styles.switchDescription}>
                        {value === 'livre'
                          ? 'Inscrição livre (automática)'
                          : 'Atribuição manual (admin)'}
                      </Text>
                    </View>
                    <Switch
                      value={value === 'manual'}
                      onValueChange={(isManual) =>
                        onChange(isManual ? 'manual' : 'livre')
                      }
                      trackColor={{ false: '#10B981', true: '#F59E0B' }}
                      thumbColor={value === 'manual' ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>
                )}
              />
            </Card>

            <View style={styles.modalActions}>
              <Button
                onPress={closeModal}
                title="Cancelar"
                variant="outline"
                size="large"
              />
              <Button
                // @ts-ignore
                onPress={handleSubmit(onSubmit)}
                title={editingSlot ? 'Salvar' : 'Criar'}
                size="large"
                loading={createSlot.isPending || updateSlot.isPending}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  slotDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  slotDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  modeIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginTop: 4,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  assignmentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  assignmentUser: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
});
