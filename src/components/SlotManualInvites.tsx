import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  useSlotInvites,
  useCreateSlotInvite,
} from '@/src/features/invites/slotInvites.api';
import { supabase } from '@/src/lib/supabase';
import { storage } from '@/src/lib/storage';

export function SlotManualInvites({ slotId }: { slotId: string }) {
  const [email, setEmail] = useState('');
  const { data: invites, isLoading: loadingInvites } = useSlotInvites(slotId);
  const createInvite = useCreateSlotInvite();
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; email: string | null; full_name: string | null }[]
  >([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const RECENT_KEY = 'recent_invite_emails_v1';
  const [namesByEmail, setNamesByEmail] = useState<Record<string, string>>({});

  // Load recent emails once
  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem(RECENT_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setRecent(arr.slice(0, 20));
        }
      } catch {}
    })();
  }, []);

  async function pushRecent(emailValue: string) {
    const norm = emailValue.toLowerCase();
    setRecent((prev) => {
      const next = [norm, ...prev.filter((e) => e !== norm)].slice(0, 20);
      storage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }

  // Debounced email suggestions (depends on profiles.email existing)
  useEffect(() => {
    const term = email.trim().toLowerCase();
    if (term.length < 2 || term.includes(' ')) {
      setSuggestions([]);
      return;
    }
    let active = true;
    setSuggestLoading(true);
    const handle = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', `${term}%`)
          .limit(5);
        if (!active) return;
        if (error) {
          setSuggestions([]);
        } else {
          const invitedSet = new Set(
            (invites || []).map((i) => i.email.toLowerCase())
          );
          setSuggestions(
            (data || []).filter(
              (r) => r.email && !invitedSet.has(r.email.toLowerCase())
            ) as any
          );
        }
      } catch {
        if (active) setSuggestions([]); // silently ignore if column missing
      } finally {
        if (active) setSuggestLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [email, invites]);

  // Fetch full names for invite emails
  useEffect(() => {
    if (!invites || invites.length === 0) return;
    const emails = Array.from(
      new Set(
        invites
          .map((i) => (i.email ? i.email.toLowerCase() : null))
          .filter((e): e is string => !!e)
      )
    );
    const missing = emails.filter((e) => !namesByEmail[e]);
    if (missing.length === 0) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, full_name')
          .in('email', missing);
        if (!error && data) {
          setNamesByEmail((prev) => {
            const next = { ...prev };
            data.forEach((r: any) => {
              if (r.email && r.full_name) {
                next[r.email.toLowerCase()] = r.full_name;
              }
            });
            return next;
          });
        }
      } catch {}
    })();
  }, [invites, namesByEmail]);

  async function add() {
    if (!email) return;
    try {
      await createInvite.mutateAsync({
        slot_id: slotId,
        email: email.trim().toLowerCase(),
      });
      await pushRecent(email.trim());
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
                  position: 'relative',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600' }}>
                  {namesByEmail[item.email.toLowerCase()] || item.email}
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
                {/* Botão X removido */}
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
              {recent.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {recent.slice(0, 8).map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setEmail(r)}
                      style={{
                        backgroundColor: '#F3F4F6',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#374151' }}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {(suggestions.length > 0 || suggestLoading) &&
                email.length >= 2 && (
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                  >
                    {suggestLoading && suggestions.length === 0 && (
                      <Text
                        style={{ fontSize: 12, color: '#6B7280', padding: 8 }}
                      >
                        Buscando...
                      </Text>
                    )}
                    {suggestions.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => setEmail(s.email || '')}
                        style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                      >
                        <Text style={{ fontSize: 14 }}>
                          {s.email} {s.full_name ? `· ${s.full_name}` : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
      {/* Modal de confirmação removido */}
    </View>
  );
}
