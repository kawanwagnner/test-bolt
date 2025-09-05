import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { differenceInHours, subHours } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
      trigger: { date } as any,
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
  assignmentId: string,
  userIsMusician?: boolean
) {
  // Schedule 24h reminder for everyone
  const notify24h = subHours(slotStartTime, 24);
  let title24h = 'Lembrete de Escala';
  let body24h = `Você tem "${slotTitle}" em 24 horas`;
  if (userIsMusician) {
    title24h = 'Lembrete Musical';
    body24h = `Não esqueça de estudar o repertório para "${slotTitle}"!`;
  }
  await scheduleLocalNotification(
    notify24h,
    title24h,
    body24h,
    `assignment_24h_${assignmentId}`
  );

  // Schedule 48h and 6h reminders for teachers
  if (userIsTeacher) {
    const notify48h = subHours(slotStartTime, 48);
    await scheduleLocalNotification(
      notify48h,
      'Lembrete de Escala (Professor)',
      `Você tem "${slotTitle}" em 48 horas - Prepare o material`,
      `assignment_48h_${assignmentId}`
    );

    const notify6h = subHours(slotStartTime, 6);
    await scheduleLocalNotification(
      notify6h,
      'Lembrete de Escala (Professor)',
      `Você tem "${slotTitle}" em 6 horas - Últimos preparativos!`,
      `assignment_6h_${assignmentId}`
    );
  }
}

// Mensagens de incentivo
const encouragementMessages = [
  'Já te disseram que você está indo muito bem? Não pare de dar seu melhor. Jesus te ama!',
  'Continue firme! Seu esforço faz a diferença.',
  'Você é importante para o time. Não desista!',
  'Deus está contigo em cada ensaio e apresentação!',
  'Seu talento é um presente. Use-o com alegria!'
];

// Função para agendar incentivo aleatório durante a semana
export async function scheduleEncouragementNotification(userId: string) {
  // Escolhe um horário aleatório nos próximos 7 dias, entre 9h e 21h
  const now = new Date();
  const randomDay = Math.floor(Math.random() * 7);
  const randomHour = 9 + Math.floor(Math.random() * 12); // 9h às 20h
  const randomMinute = Math.floor(Math.random() * 60);
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + randomDay, randomHour, randomMinute, 0);
  const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  await scheduleLocalNotification(
    date,
    'Mensagem de Incentivo',
    message,
    `encouragement_${userId}_${date.getTime()}`
  );
}

export async function cancelAssignmentNotifications(assignmentId: string) {
  await cancelNotification(`assignment_24h_${assignmentId}`);
  await cancelNotification(`assignment_48h_${assignmentId}`);
}