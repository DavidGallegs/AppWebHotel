import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, parseISO } from 'date-fns';
import { api } from '../dashboard/api';

/**
 * Hook de administración centralizado.
 * Gestiona el estado global de reservas, ocupación y estados del SES.
 */
export const useAdmin = (habitacionId?: string) => {
  const queryClient = useQueryClient();

  // --- CONSULTAS (QUERIES) ---
  
  // 1. Listado de reservas generales
  const reservasQuery = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const res = await api.get('/admin/reservations');
      return res.data;
    },
  });

  // 2. Calendario de ocupación de habitaciones
  const ocupacionQuery = useQuery({
    queryKey: ['admin-occupancy', habitacionId],
    queryFn: async () => {
      const res = await api.get(`/ocupacion?habitacion=${habitacionId}`);
      if (res.data.diasOcupados) {
        return res.data.diasOcupados.map((f: string) => startOfDay(parseISO(f)));
      }
      return [];
    },
    enabled: !!habitacionId,
  });

  // 3. NUEVA: Historial y estados del SES (Hospederías)
  const sesQuery = useQuery({
    queryKey: ['admin-ses-data'],
    queryFn: async () => {
      // Esta es la ruta GET que tu compañero habilitará en el backend
      const res = await api.get('/admin/ses/data'); 
      return res.data;
    },
    // Opcional: Se refresca automáticamente cada 15 segundos para ver actualizaciones del back
    refetchInterval: 15000, 
  });

  // --- ACCIONES (MUTACIONES) ---
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
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ses-data'] });
      alert(" Proceso completado: Reserva y Check-in realizados.");
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
    sesData: sesQuery.data, // <-- Aquí exportamos la variable que faltaba
    mutations: {
      confirmarPagoYAprobar,
      resolverSolicitud,
      cancelarReservaAdmin,
      bloquearFechas,
      crearWalkIn
    }
  };
};