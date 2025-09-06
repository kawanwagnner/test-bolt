import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
  scheduleLocalNotification,
  cancelNotification,
  scheduleAssignmentNotifications,
  cancelAssignmentNotifications,
} from '@/src/lib/notifications';
import { fetchPublicEvents } from '@/src/features/events/publicEvents.api';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import notificationRoutines from './notificationRoutines.json';
import { useRoutineEncouragement } from './useRoutineEncouragement';

interface NotificationContextProps {
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  schedule: typeof scheduleLocalNotification;
  cancel: typeof cancelNotification;
  scheduleAssignment: typeof scheduleAssignmentNotifications;
  cancelAssignment: typeof cancelAssignmentNotifications;
  initialized: boolean;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const qc = useQueryClient();

  // Função utilitária para normalizar o status de permissão
  const isGranted = (result: { status: string }) => result.status === 'granted';

  const requestPermissions = useCallback(async () => {
    const result = await requestNotificationPermissions();
    const granted = isGranted(result);
    setPermissionsGranted(granted);
    return granted;
  }, []);

  // Funções customizadas para rotinas
  const { sendEncouragementMusician, sendEncouragementTeacher } =
    useRoutineEncouragement();

  const checkEventsAndNotify = useCallback(async () => {
    try {
      const events = await fetchPublicEvents();
      const today = format(new Date(), 'yyyy-MM-dd');
      const hasEvent = events.some((e) => e.date === today);
      if (hasEvent) {
        await scheduleLocalNotification(
          new Date(),
          'Eventos de hoje',
          'Você tem eventos agendados para hoje. Confira sua agenda!',
          'routine_events_today'
        );
      } else {
        await showNoEventsMessage();
      }
    } catch (e) {
      // fallback: mostra mensagem padrão
      await showNoEventsMessage();
    }
  }, []);

  const showNoEventsMessage = useCallback(async () => {
    await scheduleLocalNotification(
      new Date(),
      'Dia livre!',
      'Não há eventos para hoje, você está com o dia livre.',
      'routine_no_events_today'
    );
  }, []);

  // Mapeamento de ações para funções
  const routineActions: Record<string, () => Promise<void>> = {
    checkEventsAndNotify,
    showNoEventsMessage,
    sendEncouragementMusician,
    sendEncouragementTeacher,
  };

  // Agendamento das rotinas
  useEffect(() => {
    if (!permissionsGranted) return;

    const now = new Date();
    const todayName = format(now, 'EEEE'); // ex: 'Monday'

    notificationRoutines.forEach((routine) => {
      if (routine.days.includes(todayName)) {
        // Parse horário
        const [hour, minute] = routine.time.split(':').map(Number);
        const routineTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour,
          minute,
          0
        );
        // Se já passou, não agenda
        if (now > routineTime) return;
        // Agenda execução
        const timeout = routineTime.getTime() - now.getTime();
        setTimeout(() => {
          const fn = routineActions[routine.action];
          if (fn) fn();
        }, timeout);
      }
    });
  }, [permissionsGranted]);

  useEffect(() => {
    (async () => {
      const result = await requestNotificationPermissions();
      const granted = isGranted(result);
      setPermissionsGranted(granted);
      if (granted) {
        await setupNotificationChannel();
        // run today's check immediately on startup so routines are triggered
        // independent of user navigation
        try {
          await checkEventsAndNotify();
        } catch (e) {
          // swallow errors from initial routine run
        }
      }
      // mark provider as initialized after initial permission check, channel setup
      // and after running the initial routines
      setInitialized(true);
    })();

    // Subscribe to announcements table for realtime notifications
    const channel = supabase.channel('public:announcements').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'announcements' },
      (payload) => {
        const row = payload.new as any;
        // Invalidate announcements query so UI updates
        qc.invalidateQueries({ queryKey: ['announcements'] });
        // Show local notification to user
        (async () => {
          await scheduleLocalNotification(new Date(), row.title || 'COMUNICADO', row.message || '', `announcement_${row.id}`);
        })();
      }
    ).subscribe();

    return () => {
      try { channel.unsubscribe(); } catch (e) {}
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        permissionsGranted,
        requestPermissions,
        schedule: scheduleLocalNotification,
        cancel: cancelNotification,
        scheduleAssignment: scheduleAssignmentNotifications,
        cancelAssignment: cancelAssignmentNotifications,
  initialized,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
