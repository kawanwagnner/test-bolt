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
  notify_48h: z.boolean().default(true), // professores
  notify_48h_musician: z.boolean().default(true), // músicos
});

export const slotSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    theme_id: z.string().optional(),
    date: z
      .string()
      .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/i, 'Data inválida (YYYY-MM-DD)')
      .min(1, 'Data é obrigatória')
      .refine(
        (val) => {
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          return val >= todayStr; // comparação lexicográfica funciona em formato YYYY-MM-DD
        },
        'Data não pode estar no passado'
      ),
    start_time: z.string().min(1, 'Horário de início é obrigatório'),
    end_time: z.string().min(1, 'Horário de fim é obrigatório'),
    mode: z.enum(['manual', 'livre']).default('livre'),
    capacity: z
      .number()
      .min(1, 'Capacidade deve ser pelo menos 1'),
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