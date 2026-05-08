// src/components/dashboard/useReservations.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Reservation } from './reservation';

// --- UTILIDAD DE NOTIFICACIONES ---
// Hace una petición silenciosa al backend para que envíe el email
const enviarNotificacion = async (tipo: string, reservaId: string | number) => {
  try {
    await api.post('/notificaciones/enviar', { tipo, reservaId });
  } catch (e) {
    console.error("Error enviando notificación al backend", e);
  }
};

// 1. Fetch de todas las reservas del usuario
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

// 2. Cancelar directamente (Solo cuando está 'pending')
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await api.patch(`/reservations/${id}/cancel`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
      // Opcional: enviarNotificacion('cancelacion_directa', id);
    },
  });
};

// 3. Solicitar Modificación (Cuando está 'approved')
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

// 4. Solicitar Cancelación (Cuando está 'approved')
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