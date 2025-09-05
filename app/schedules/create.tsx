import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSchedule } from '@/src/features/schedules/schedules.api';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { scheduleSchema, ScheduleInput } from '@/src/utils/validation';
import { Calendar, ArrowLeft, Bell } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function CreateScheduleScreen() {
  const router = useRouter();
  const createScheduleMutation = useCreateSchedule();

  const today = new Date().toISOString().slice(0, 10);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleInput>({
    // @ts-ignore
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      date: today, // atribui automaticamente
      description: '',
      notify_24h: true,
      notify_48h: true,
      notify_48h_musician: true,
    },
  });

  const onSubmit = async (data: ScheduleInput) => {
    try {
      await createScheduleMutation.mutateAsync({
        ...data,
        created_by: undefined, // Will be set by RLS
      });
      Alert.alert('Sucesso!', 'Escala criada com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar a escala');
    }
  };

  // Campo de data removido da UI; valor atribuído automaticamente.

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Escala</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated">
            <View style={styles.formHeader}>
              <Calendar size={24} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.formTitle}>Informações da Escala</Text>
            </View>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Título"
                  placeholder="Ex: Escalas da semana"
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
                  placeholder="Descreva a escala..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              )}
            />

            {/* Data agora automática (data de hoje). Campo oculto. */}
          </Card>

          <Card variant="elevated">
            <View style={styles.formHeader}>
              <Bell size={24} color="#10B981" strokeWidth={2} />
              <Text style={styles.formTitle}>Configurações de Notificação</Text>
            </View>

            <Controller
              control={control}
              name="notify_24h"
              render={({ field: { value, onChange } }) => (
                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Lembrete 24h antes</Text>
                    <Text style={styles.switchDescription}>
                      Notificar todos os participantes 24 horas antes
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                    thumbColor={value ? '#3B82F6' : '#9CA3AF'}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="notify_48h"
              render={({ field: { value, onChange } }) => (
                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>
                      Lembrete 48h antes (Professores)
                    </Text>
                    <Text style={styles.switchDescription}>
                      Notificar professores com 48 horas de antecedência
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                    thumbColor={value ? '#3B82F6' : '#9CA3AF'}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="notify_48h_musician"
              render={({ field: { value, onChange } }) => (
                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>
                      Lembrete 48h antes (Músicos)
                    </Text>
                    <Text style={styles.switchDescription}>
                      Notificar músicos com 48 horas de antecedência
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                    thumbColor={value ? '#3B82F6' : '#9CA3AF'}
                  />
                </View>
              )}
            />
          </Card>

          <View style={styles.actions}>
            <Button
              onPress={() => router.back()}
              title="Cancelar"
              variant="outline"
              size="large"
            />
            <Button
              onPress={handleSubmit((data) =>
                onSubmit(data as unknown as ScheduleInput)
              )}
              title="Criar Escala"
              size="large"
              loading={createScheduleMutation.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
});
