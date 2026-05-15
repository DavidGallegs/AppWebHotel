import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { api } from '../dashboard/api';

/**
 * Hook personalizado para centralizar toda la lógica del administrador.
 * @param habitacionId Opcional, para filtrar la ocupación en el calendario.
 */
export const useAdmin = (habitacionId?: string) => {
  const queryClient = useQueryClient();

  // OBTENER RESERVAS: Se actualiza automáticamente cuando invalidamos su clave
  const reservasQuery = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const res = await api.get('/admin/reservations');
      return res.data;
    },
  });

  // OBTENER OCUPACIÓN: Se recarga cuando cambia la habitación o cuando bloqueamos fechas
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

  // MUTACIÓN: Confirmar pago y aprobar
  const confirmarPagoYAprobar = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/admin/reservations/${id}/confirmar-pago`),
    onSuccess: () => {
      // Al invalidar, React Query vuelve a pedir las reservas automáticamente
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Pago verificado y reserva aprobada.");
    }
  });

  // MUTACIÓN: Resolver solicitudes (Cambios de fecha o cancelaciones del cliente)
  const resolverSolicitud = useMutation({
    mutationFn: async ({ id, accion, tipo }: { id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel' }) => {
      await api.post(`/admin/reservations/${id}/resolve`, { accion, tipo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    }
  });

  // MUTACIÓN: Anulación directa por el Admin
  const cancelarReservaAdmin = useMutation({
    mutationFn: async (id: string | number) => await api.delete(`/admin/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Reserva anulada correctamente.");
    }
  });

  // MUTACIÓN: Bloqueo de calendario (Vacaciones)
  const bloquearFechas = useMutation({
    mutationFn: async (data: { habitacion_id: string, fechaInicio: string, fechaFin: string }) => {
      await api.post('/admin/bloqueos', data);
    },
    onSuccess: (_, variables) => {
      // Invalidamos la ocupación de esa habitación específica para que el calendario se pinte de rojo
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy', variables.habitacion_id] });
      alert("Fechas bloqueadas correctamente.");
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
      bloquearFechas
    }
  };
};