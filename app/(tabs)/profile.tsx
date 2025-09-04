import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { User, Shield, BookOpen, LogOut, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'member':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.profile?.full_name || 'Usuário'}
              </Text>
              <View style={styles.roleContainer}>
                <Shield
                  size={16}
                  color={getRoleColor(user.profile?.role || 'member')}
                />
                <Text
                  style={[
                    styles.roleText,
                    { color: getRoleColor(user.profile?.role || 'member') },
                  ]}
                >
                  {getRoleText(user.profile?.role || 'member')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Mail size={20} color="#6B7280" />
              <Text style={styles.detailText}>{user.email}</Text>
            </View>

            {user.profile?.is_teacher && (
              <View style={styles.detailItem}>
                <BookOpen size={20} color="#7C3AED" />
                <Text style={[styles.detailText, { color: '#7C3AED' }]}>
                  Professor
                </Text>
              </View>
            )}
          </View>
        </Card>

        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre o App</Text>
          <Text style={styles.infoText}>
            O EscalasApp permite gerenciar escalas dinâmicas com temas e tarefas
            organizadas por dia.
          </Text>
          <Text style={styles.infoText}>
            • Receba lembretes automáticos 24h antes
          </Text>
          <Text style={styles.infoText}>
            • Professores recebem lembretes adicionais 48h antes
          </Text>
          <Text style={styles.infoText}>• Atualizações em tempo real</Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleSignOut}
          title="Sair"
          variant="outline"
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  infoCard: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
