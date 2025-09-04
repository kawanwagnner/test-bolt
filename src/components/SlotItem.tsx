import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Users, User } from 'lucide-react-native';
import { SlotWithDetails } from '@/src/features/slots/slots.types';
import { formatTime } from '@/src/utils/dates';
import { Button } from './Button';

interface SlotItemProps {
  slot: SlotWithDetails;
  onAssign?: () => void;
  onUnassign?: () => void;
  onManage?: () => void;
  canAssign?: boolean;
  canUnassign?: boolean;
  canManage?: boolean;
  isAssigned?: boolean;
  loading?: boolean;
}

export function SlotItem({
  slot,
  onAssign,
  onUnassign,
  onManage,
  canAssign = false,
  canUnassign = false,
  canManage = false,
  isAssigned = false,
  loading = false,
}: SlotItemProps) {
  const isFull = slot.available_spots <= 0;
  const isManualMode = slot.mode === 'manual';

  return (
    <View style={[styles.container, isAssigned && styles.assignedContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>{slot.title || 'Slot sem título'}</Text>
        <View style={styles.modeIndicator}>
          <Text
            style={[
              styles.modeText,
              { color: isManualMode ? '#F59E0B' : '#10B981' },
            ]}
          >
            {isManualMode ? 'Manual' : 'Livre'}
          </Text>
        </View>
      </View>

      {slot.description && (
        <Text style={styles.description}>{slot.description}</Text>
      )}

      {slot.theme && <Text style={styles.theme}>Tema: {slot.theme.name}</Text>}

      <View style={styles.details}>
        {slot.start_time && slot.end_time && (
          <View style={styles.timeContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
            </Text>
          </View>
        )}

        <View style={styles.capacityContainer}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.capacityText}>
            {slot.assignments.length}/{slot.capacity} vagas
          </Text>
        </View>
      </View>

      {slot.assignments.length > 0 && (
        <View style={styles.assignedUsers}>
          <Text style={styles.assignedLabel}>Inscritos:</Text>
          {slot.assignments.map((assignment) => (
            <View key={assignment.id} style={styles.userItem}>
              <User size={14} color="#374151" />
              <Text style={styles.userName}>{assignment.user.full_name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {canManage && (
          <Button
            onPress={onManage || (() => {})}
            title="Gerenciar"
            variant="outline"
            size="small"
          />
        )}

        {canAssign && !isAssigned && !isFull && (
          <Button
            onPress={onAssign || (() => {})}
            title={isManualMode ? 'Solicitar' : 'Inscrever-se'}
            variant="primary"
            size="small"
            loading={loading}
          />
        )}

        {canUnassign && isAssigned && (
          <Button
            onPress={onUnassign || (() => {})}
            title="Cancelar"
            variant="danger"
            size="small"
            loading={loading}
          />
        )}

        {!canAssign && !canUnassign && isFull && (
          <Text style={styles.fullText}>Slot cheio</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assignedContainer: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  modeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  theme: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  assignedUsers: {
    marginBottom: 12,
  },
  assignedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  userName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  fullText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
