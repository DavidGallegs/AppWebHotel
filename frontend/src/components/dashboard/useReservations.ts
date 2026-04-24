import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Reservation } from './reservation';

// 1. Función fetch
const fetchReservations = async (): Promise<Reservation[]> => {
  // Axios automáticamente añade el 'Bearer Token' gracias al Proveedor
  const response = await api.get('/reservations'); 
  return response.data;
};

// 2. El Hook que usaremos en nuestra Isla de React
export const useReservations = () => {
  return useQuery({
    // queryKey es como el "nombre del cajón" donde TanStack Query guarda la caché
    queryKey: ['user-reservations'], 
    queryFn: fetchReservations,
    // Opcional: Le decimos que los datos son "frescos" durante 1 minuto
    // antes de volver a preguntar a Laravel en segundo plano
    staleTime: 1000 * 60, 
  });
};