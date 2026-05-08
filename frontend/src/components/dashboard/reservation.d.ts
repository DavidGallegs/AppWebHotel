export type ReservationStatus = 'pending' | 'approved' | 'cancelled' | 'finished';

export interface Reservation {
  id: string | number;
  nombre: string;
  apellido1: string;
  fechaEntrada: string;
  fechaSalida: string;
  status: ReservationStatus;
  // Campos nuevos para el flujo de solicitudes
  solicitud_cancelacion: number; // 0 o 1
  datos_modificacion: string | null; // JSON con los nuevos datos solicitados
  email?: string; // Para notificaciones
}