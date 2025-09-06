import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  useMySlotInvites,
  useRespondSlotInvite,
} from '@/src/features/invites/slotInvites.api';
import { useAnnouncements } from '@/src/features/announcements/announcements.api';
import { useRouter } from 'expo-router';

export default function InvitesScreen() {
  const { data: invites, isLoading, refetch } = useMySlotInvites();
  const respond = useRespondSlotInvite();
  const { data: announcements } = useAnnouncements();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Convites</Text>
      </View>
      <FlatList
        data={invites || []}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={() => (
          announcements && announcements.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Comunicados</Text>
              {announcements.map(a => (
                <View key={a.id} style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ fontWeight: '700' }}>{a.title}</Text>
                  {a.message ? <Text style={{ color: '#374151', marginTop: 6 }}>{a.message}</Text> : null}
                </View>
              ))}
            </View>
          ) : null
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.slot?.title || 'Slot'}</Text>
              <Text style={styles.cardSub}>{item.email}</Text>
              <Text style={styles.cardStatus}>Status: {item.status}</Text>
            </View>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#10B981' }]}
                  onPress={() =>
                    respond.mutate({ invite_id: item.id, accept: true })
                  }
                  disabled={respond.isPending}
                >
                  <Text style={styles.btnText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#EF4444' }]}
                  onPress={() =>
                    respond.mutate({ invite_id: item.id, accept: false })
                  }
                  disabled={respond.isPending}
                >
                  <Text style={styles.btnText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280' }}>
                Nenhum convite no momento.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardStatus: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    fontWeight: '500',
  },
  actions: { justifyContent: 'center', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
