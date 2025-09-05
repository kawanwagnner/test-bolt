import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  useSlotInvites,
  useCreateSlotInvite,
} from '@/src/features/invites/slotInvites.api';

export function SlotManualInvites({ slotId }: { slotId: string }) {
  const [email, setEmail] = useState('');
  const { data: invites, isLoading: loadingInvites } = useSlotInvites(slotId);
  const createInvite = useCreateSlotInvite();
  const [modalOpen, setModalOpen] = useState(false);

  async function add() {
    if (!email) return;
    try {
      await createInvite.mutateAsync({
        slot_id: slotId,
        email: email.trim().toLowerCase(),
      });
      setEmail('');
    } catch (e) {
      /* noop - poderia mostrar toast */
    }
  }

  return (
    <View style={{ marginTop: 12, gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: '600', fontSize: 14 }}>
          Convites Manuais
        </Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: '#2563EB',
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            Adicionar
          </Text>
        </Pressable>
      </View>
      {loadingInvites ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={invites}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const statusMap: Record<
              string,
              { label: string; bg: string; text: string }
            > = {
              pending: { label: 'Pendente', bg: '#FEF3C7', text: '#92400E' },
              accepted: { label: 'Confirmado', bg: '#D1FAE5', text: '#065F46' },
              declined: { label: 'Recusado', bg: '#FEE2E2', text: '#991B1B' },
            };
            const cfg = statusMap[item.status] || statusMap.pending;
            return (
              <View
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: '#FFFFFF',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500' }}>
                  {item.email}
                </Text>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: cfg.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ fontSize: 11, fontWeight: '600', color: cfg.text }}
                  >
                    {cfg.label}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Nenhum convite.
            </Text>
          }
        />
      )}

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Pressable onPress={() => setModalOpen(false)}>
              <Text style={{ color: '#2563EB', fontWeight: '600' }}>
                Fechar
              </Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>
              Adicionar Convite
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              />
              <Pressable
                onPress={async () => {
                  await add();
                  if (!createInvite.isPending) setModalOpen(false);
                }}
                disabled={!email || createInvite.isPending}
                style={{
                  backgroundColor:
                    !email || createInvite.isPending ? '#9CA3AF' : '#2563EB',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {createInvite.isPending ? 'Enviando...' : 'Convidar'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
