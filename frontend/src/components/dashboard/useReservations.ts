import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Reservation } from './reservation';

// 1. Funciones fetch
const fetchReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations'); 
  return response.data;
};

// Función para cancelar la reserva en Laravel
const cancelReservation = async (id: string | number) => {
  // ATENCIÓN: Ajusta esta URL o método (patch/delete) según lo que espere tu compañero de backend
  const response = await api.patch(`/reservations/${id}/cancel`);
  return response.data;
};

// 2. Hooks que usaremos en nuestra Isla de React
export const useReservations = () => {
  return useQuery({
    queryKey: ['user-reservations'], 
    queryFn: fetchReservations,
    staleTime: 1000 * 60, 
  });
};

// Hook para la mutación de cancelar
export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      // Invalida la caché. Esto hace que useReservations vuelva a pedir los datos actualizados a Laravel.
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
    },
  });
};

// Hook para la mutación de modificar (Update)
export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Recibimos el ID de la reserva y los datos limpios del formulario
    mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
      // ATENCIÓN: Ajusta la ruta y el método (put/patch) según tu backend
      const response = await api.put(`/reservations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Magia: Forzamos a que la lista se recargue sola con los nuevos datos
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
    },
  });
};