import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, parseISO } from 'date-fns';
import { api } from '../dashboard/api';

/* * ARCHIVO: useAdmin.ts
 * Propósito: Es el "centro de control de datos" del administrador. 
 * Agrupa todas las llamadas a la API en un solo lugar usando React Query.
 * Esto evita repetir código en las pestañas y mantiene los datos sincronizados.
 */
export const useAdmin = (habitacionId?: string) => {
  const queryClient = useQueryClient();

  // --- CONSULTAS (QUERIES): TRAER DATOS ---
  
  // 1. Trae TODAS las reservas del sistema para la tabla principal.
  const reservasQuery = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const res = await api.get('/admin/reservations');
      return res.data;
    },
  });

  // 2. Trae los días que ya están reservados o bloqueados manualmente para una habitación específica.
  const ocupacionQuery = useQuery({
    queryKey: ['admin-occupancy', habitacionId],
    queryFn: async () => {
      const res = await api.get(`/ocupacion?habitacion=${habitacionId}`);
      if (res.data.diasOcupados) {
        return res.data.diasOcupados.map((f: string) => startOfDay(parseISO(f)));
      }
      return [];
    },
    // Solo hace la petición si realmente le pasamos una habitación
    enabled: !!habitacionId,
  });

  // 3. Trae el historial de comunicaciones con la policía (Hospederías/SES).
  const sesQuery = useQuery({
    queryKey: ['admin-ses-data'],
    queryFn: async () => {
      const res = await api.get('/admin/ses/data'); 
      return res.data;
    },
    // Magia: Cada 15 segundos vuelve a preguntar al servidor en silencio por si la policía ya respondió.
    refetchInterval: 15000, 
  });

  // --- ACCIONES (MUTACIONES): MODIFICAR DATOS ---
  // Nota: Cada vez que una acción tiene éxito (onSuccess), usamos invalidateQueries.
  // Esto le dice a React: "Oye, los datos viejos ya no sirven, vuelve a ejecutar las Queries de arriba".

  const confirmarPagoYAprobar = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/admin/reservations/${id}/confirmar-pago`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Pago verificado correctamente.");
    }
  });

  const resolverSolicitud = useMutation({
    mutationFn: async ({ id, accion, tipo }: { id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel' }) => {
      await api.post(`/admin/reservations/${id}/resolve`, { accion, tipo });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
  });

  const cancelarReservaAdmin = useMutation({
    mutationFn: async (id: string | number) => await api.delete(`/admin/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ses-data'] });
      alert("Reserva anulada.");
    }
  });

  const bloquearFechas = useMutation({
    mutationFn: async (data: { habitacion_id: string, fechaInicio: string, fechaFin: string }) => {
      await api.post('/admin/bloqueos', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy', variables.habitacion_id] });
      alert("Fechas bloqueadas con éxito.");
    }
  });

  const crearWalkIn = useMutation({
    mutationFn: async (payload: any) => await api.post('/admin/walk-in', payload),
    onSuccess: () => {
      // Un Walk-in afecta a todo: a la tabla, al calendario y al SES. Invalidamos todo.
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ses-data'] });
      alert("Proceso completado: Reserva y Check-in realizados.");
    },
    onError: (error) => {
      console.error("Error en Walk-in:", error);
      alert("Hubo un error al procesar el check-in directo.");
    }
  });

  return {
    reservas: reservasQuery.data,
    ocupacion: ocupacionQuery.data,
    estaCargandoOcupacion: ocupacionQuery.isLoading,
    sesData: sesQuery.data, 
    mutations: {
      confirmarPagoYAprobar,
      resolverSolicitud,
      cancelarReservaAdmin,
      bloquearFechas,
      crearWalkIn
    }
  };
};