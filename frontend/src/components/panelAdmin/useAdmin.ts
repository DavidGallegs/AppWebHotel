import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { api } from '../dashboard/api';

/**
 * Hook central de administración con reactividad automática (Sin F5).
 */
export const useAdmin = (habitacionId?: string) => {
  const queryClient = useQueryClient();

  // --- QUERIES ---
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

  // --- MUTATIONS ---
  const confirmarPagoYAprobar = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/admin/reservations/${id}/confirmar-pago`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Pago verificado y reserva aprobada.");
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
      alert("Reserva anulada correctamente.");
    }
  });

  const bloquearFechas = useMutation({
    mutationFn: async (data: { habitacion_id: string, fechaInicio: string, fechaFin: string }) => {
      await api.post('/admin/bloqueos', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy', variables.habitacion_id] });
      alert("Fechas bloqueadas correctamente.");
    }
  });

  // NUEVA MUTACIÓN PARA WALK-IN
  const crearWalkIn = useMutation({
    mutationFn: async (payload: any) => await api.post('/admin/walk-in', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy'] });
      alert("✅ Check-in directo realizado con éxito.");
    },
    onError: (error) => {
      console.error("Error Walk-in:", error);
      alert("Error al crear el check-in directo.");
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
      crearWalkIn // Exportada correctamente
    }
  };
};