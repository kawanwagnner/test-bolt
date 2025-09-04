import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Users, Clock } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: 'calendar' | 'users' | 'clock';
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon = 'calendar', action }: EmptyStateProps) {
  const IconComponent = {
    calendar: Calendar,
    users: Users,
    clock: Clock,
  }[icon];

  return (
    <View style={styles.container}>
      <IconComponent size={64} color="#9CA3AF" strokeWidth={1.5} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  action: {
    marginTop: 24,
  },
});