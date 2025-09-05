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

interface NotificationContextProps {
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  schedule: typeof scheduleLocalNotification;
  cancel: typeof cancelNotification;
  scheduleAssignment: typeof scheduleAssignmentNotifications;
  cancelAssignment: typeof cancelAssignmentNotifications;
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

  // Função utilitária para normalizar o status de permissão
  const isGranted = (result: { status: string }) => result.status === 'granted';

  const requestPermissions = useCallback(async () => {
    const result = await requestNotificationPermissions();
    const granted = isGranted(result);
    setPermissionsGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    (async () => {
      const result = await requestNotificationPermissions();
      const granted = isGranted(result);
      setPermissionsGranted(granted);
      if (granted) {
        await setupNotificationChannel();
      }
    })();
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
