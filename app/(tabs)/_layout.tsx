import { Tabs } from 'expo-router';
import { Calendar, User, HomeIcon, Users, Plus } from 'lucide-react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

export default function TabLayout() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOnSchedulesIndex = Boolean(pathname && /\/schedules(\/)?$/.test(pathname));
  const agendaScreen = useMemo(
    () =>
      isAdmin
        ? { name: 'admin/events-agenda', title: 'Agenda', icon: Calendar }
        : { name: 'events/agenda', title: 'Agenda', icon: Calendar },
    [isAdmin]
  );
  return (
    <>
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
            <Calendar size={size} color={color} strokeWidth={2} />
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
  {isAdmin && isOnSchedulesIndex ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', right: 0, bottom: 0 }}>
          <View style={styles.fabRow} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.pill}
              onPress={() => router.push('/admin/announcements')}
              accessibilityLabel="Ver comunicados"
            >
              <Text style={styles.pillText}>Comunicados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/admin/announcements')}
              accessibilityLabel="Abrir comunicados"
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  adminButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 92,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
    marginBottom: 92,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pillText: {
    color: '#111827',
    fontWeight: '700',
  },
});
