import { Tabs } from 'expo-router';
import { Calendar, User, BookOpen, HomeIcon, Users } from 'lucide-react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { useMemo } from 'react';

export default function TabLayout() {
  const { isAdmin } = useAuth();
  const agendaScreen = useMemo(
    () =>
      isAdmin
        ? { name: 'admin/events-agenda', title: 'Agenda', icon: BookOpen }
        : { name: 'events/agenda', title: 'Agenda', icon: BookOpen },
    [isAdmin]
  );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ size, color }) => (
            <HomeIcon size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name={agendaScreen.name}
        options={{
          title: agendaScreen.title,
          tabBarIcon: ({ size, color }) => (
            <agendaScreen.icon size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="events-list"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="invites"
        options={{
          title: 'Convites',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
