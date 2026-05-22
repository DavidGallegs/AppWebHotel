/* * ARCHIVO: reservation.d.ts
 * Propósito: Es el "contrato" de TypeScript. Aquí definimos exactamente qué forma 
 * tienen los datos de una reserva. Así, si intentamos leer un dato que no existe, 
 * el editor de código nos avisará antes de que la app se rompa.
 */

export type ReservationStatus = 'pending' | 'approved' | 'cancelled' | 'finished';

export interface Reservation {
  id: string | number;
  nombre: string;
  apellido1: string;
  fechaEntrada: string;
  fechaSalida: string;
  status: ReservationStatus;
  
  // Estos campos manejan la lógica de si el usuario ha pedido cancelar 
  // o modificar algo, y el administrador aún no lo ha aprobado.
  solicitud_cancelacion: number; // 0 (No) o 1 (Sí)
  datos_modificacion: string | null; // JSON con los nuevos datos solicitados
  email?: string; // Para notificaciones automáticas (opcional)
}