import { useAuth } from '@/src/features/auth/useAuth';
import { scheduleEncouragementNotification } from '@/src/lib/notifications';

export function useRoutineEncouragement() {
  const { user } = useAuth();

  // Envia incentivo para músico
  const sendEncouragementMusician = async () => {
    if (user && user.profile && user.profile.is_musician) {
      await scheduleEncouragementNotification(user.id);
    }
  };

  // Envia incentivo para professor
  const sendEncouragementTeacher = async () => {
    if (user && user.profile && user.profile.is_teacher) {
      await scheduleEncouragementNotification(user.id);
    }
  };

  return { sendEncouragementMusician, sendEncouragementTeacher };
}
