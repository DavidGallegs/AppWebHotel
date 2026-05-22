// src/components/dashboard/useReservations.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Reservation } from './reservation';

/* * FUNCIÓN: enviarNotificacion (Interna)
 * Propósito: Hace una llamada rápida al backend para decirle que dispare un email.
 * Es silenciosa, si falla, solo lo vemos en consola, no bloquea al usuario.
 */
const enviarNotificacion = async (tipo: string, reservaId: string | number) => {
  try {
    await api.post('/notificaciones/enviar', { tipo, reservaId });
  } catch (e) {
    console.error("Error enviando notificación al backend", e);
  }
};

/* * HOOK: useReservations
 * Propósito: Trae la lista completa de reservas del usuario logueado.
 * React Query guarda estos datos bajo la etiqueta (queryKey) 'user-reservations'.
 * staleTime: 60000 -> Durante 1 minuto considerará que los datos están "frescos" y no hará otra petición.
 */
export const useReservations = () => {
  return useQuery({
    queryKey: ['user-reservations'], 
    queryFn: async (): Promise<Reservation[]> => {
      const response = await api.get('/reservations'); 
      return response.data;
    },
    staleTime: 1000 * 60, 
  });
};

/* * HOOK: useCancelReservation
 * Propósito: Permite al usuario cancelar su reserva SOLO si está en estado 'pending'.
 * Cuando tiene éxito, avisa a React Query de que la lista 'user-reservations' está obsoleta, 
 * forzando a que se recargue sola y veamos la reserva como "Cancelada".
 */
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await api.patch(`/reservations/${id}/cancel`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
    },
  });
};

/* * HOOK: useRequestModification
 * Propósito: Cuando la reserva ya está 'approved', el usuario no puede cambiarla directamente.
 * Manda los nuevos datos propuestos al admin para que los revise.
 */
export const useRequestModification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
      const response = await api.patch(`/reservations/${id}/request-modification`, { datos: data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
      enviarNotificacion('solicitud_modificacion_admin', variables.id);
    }
  });
};

/* * HOOK: useRequestCancellation
 * Propósito: Igual que el de modificar, pero para pedir una cancelación formal al admin
 * cuando la reserva ya había sido aprobada y posiblemente pagada.
 */
export const useRequestCancellation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await api.patch(`/reservations/${id}/request-cancellation`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
      enviarNotificacion('solicitud_cancelacion_admin', id);
    }
  });
};