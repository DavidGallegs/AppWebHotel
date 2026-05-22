import { z } from 'zod';

/* * ESQUEMAS DE AUTENTICACIÓN
 * Propósito: Define las reglas de oro para los formularios de acceso.
 * Si un dato no pasa por aquí, ni siquiera se molesta en hacer la petición al servidor.
 */

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
  apellido1: z.string().min(2, "El primer apellido es obligatorio"),
  password: z.string().min(6, { error: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  //Compara dos campos diferentes para asegurar que el usuario no se equivocó al teclear
  error: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type JoinFormValues = z.infer<typeof joinSchema>;