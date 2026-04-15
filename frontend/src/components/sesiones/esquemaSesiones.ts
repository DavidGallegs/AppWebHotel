import { z } from 'zod';

// Esquema para el Login
export const loginSchema = z.object({
  email: z.email({ error: 'Formato de correo inválido' }),
  password: z.string().min(6, { error: 'La contraseña debe tener al menos 6 caracteres' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Esquema para el Registro (Join)
export const joinSchema = z.object({
  nombre: z.string().min(2, { error: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.email({ error: 'Formato de correo inválido' }),
  password: z.string().min(6, { error: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  error: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type JoinFormValues = z.infer<typeof joinSchema>;