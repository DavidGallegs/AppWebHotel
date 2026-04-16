export type ReservationStatus = 'pending' | 'approved' | 'cancelled' | 'finished';

export interface Reservation {
  id: string | number;
  nombre: string;
  apellido1: string;
  fechaEntrada: string;
  fechaSalida: string;
  status: ReservationStatus;
}