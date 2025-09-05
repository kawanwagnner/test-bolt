import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const scheduleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  notify_24h: z.boolean().default(true),
  notify_48h: z.boolean().default(false),
});

export const slotSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    theme_id: z.string().optional(),
    start_time: z.string().min(1, 'Horário de início é obrigatório'),
    end_time: z.string().min(1, 'Horário de fim é obrigatório'),
    mode: z.enum(['manual', 'livre']).default('livre'),
    capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').default(1),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      // compara como string 'HH:mm', funciona para horários no mesmo dia
      return data.end_time > data.start_time;
    },
    {
      message: 'O horário de fim deve ser após o início',
      path: ['end_time'],
    }
  );

export const themeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type SlotInput = z.infer<typeof slotSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;