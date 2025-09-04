import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { differenceInHours, subHours } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') {
    return { status: 'granted' as const };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    return { status };
  }
  
  return { status: existingStatus };
}

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }
}

export async function scheduleLocalNotification(
  date: Date,
  title: string,
  body: string,
  identifier: string
): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web platform');
    return null;
  }

  const now = new Date();
  const hoursUntilNotification = differenceInHours(date, now);

  if (hoursUntilNotification <= 0) {
    return null; // Don't schedule past notifications
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { identifier },
      },
      trigger: { date },
      identifier,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelNotification(identifier: string) {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function scheduleAssignmentNotifications(
  slotStartTime: Date,
  slotTitle: string,
  userIsTeacher: boolean,
  assignmentId: string
) {
  // Schedule 24h reminder for everyone
  const notify24h = subHours(slotStartTime, 24);
  await scheduleLocalNotification(
    notify24h,
    'Lembrete de Escala',
    `Você tem "${slotTitle}" em 24 horas`,
    `assignment_24h_${assignmentId}`
  );

  // Schedule 48h reminder for teachers
  if (userIsTeacher) {
    const notify48h = subHours(slotStartTime, 48);
    await scheduleLocalNotification(
      notify48h,
      'Lembrete de Escala (Professor)',
      `Você tem "${slotTitle}" em 48 horas - Prepare o material`,
      `assignment_48h_${assignmentId}`
    );
  }
}

export async function cancelAssignmentNotifications(assignmentId: string) {
  await cancelNotification(`assignment_24h_${assignmentId}`);
  await cancelNotification(`assignment_48h_${assignmentId}`);
}