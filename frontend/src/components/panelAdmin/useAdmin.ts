import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, parseISO } from 'date-fns';
import { api } from '../dashboard/api';

/**
 * Hook de administración centralizado.
 * Gestiona el estado global de reservas y ocupación sin refrescos de página.
 */
export const useAdmin = (habitacionId?: string) => {
  const queryClient = useQueryClient();

  // --- CONSULTAS ---
  const reservasQuery = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const res = await api.get('/admin/reservations');
      return res.data;
    },
  });

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
      alert("✅ Proceso completado: Reserva y Check-in realizados.");
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
    mutations: {
      confirmarPagoYAprobar,
      resolverSolicitud,
      cancelarReservaAdmin,
      bloquearFechas,
      crearWalkIn
    }
  };
};