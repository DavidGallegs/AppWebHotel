import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useReservations, useCancelReservation, useRequestModification } from './useReservations';
import type { Reservation } from './reservation';
import { QueryProvider } from './QueryProvider'; 
import { FormularioModificar } from './FormularioModificar';
import { api } from './api'; 

// Importamos nuestros nuevos fragmentos
import { ReservationCard } from './ReservationCard';
import { ModalDetalles } from './ModalDetalles';

export interface FullReservation extends Reservation {
  // ... (Tus interfaces se mantienen exactamente iguales aquí arriba)
  habitacion?: string;
  numPersonas?: number;
  solicitud_cancelacion: number;
  datos_modificacion: string | null;
  estado_pago?: 'pendiente' | 'notificado' | 'pagado' | 'devolucion_solicitada'; 
  contrato?: any;
  titular?: any;
}

/* * COMPONENTE: ReservationListContent
 * Propósito: Actúa como el controlador principal. Gestiona las peticiones al servidor 
 * y pasa la información hacia abajo a las tarjetas individuales y los modales.
 */
const ReservationListContent = () => {
  const queryClient = useQueryClient();
  const { data: reservations, isLoading, isError } = useReservations();
  const { mutate: cancelarDirecto } = useCancelReservation();
  const { mutate: solicitarMod } = useRequestModification();

  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  const [reservaEditando, setReservaEditando] = useState<FullReservation | null>(null);

  // Hook de notificaciones
  const notificarPago = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/reservations/${id}/notificar-pago`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
      alert("¡Gracias! Hemos notificado al administrador.");
    }
  });

  const solicitarDevolucion = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/reservations/${id}/solicitar-devolucion`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
      alert("Solicitud de anulación enviada correctamente.");
    }
  });

  if (isLoading) return <div className="p-4" aria-live="polite">Cargando tus reservas...</div>;
  if (isError) return <div className="p-4 text-red-500" aria-live="assertive">Error al conectar con el servidor.</div>;

  return (
    <div className="reserva-list-container">
      {/* 1. Mapeamos las tarjetas renderizando nuestro componente limpio */}
      {reservations?.map((res: FullReservation) => (
        <ReservationCard 
          key={res.id} 
          res={res}
          onVerDetalles={setReservaDetalle}
          onModificar={setReservaEditando}
          onCancelar={(id) => {
            if(confirm('¿Seguro que quieres cancelar la reserva?')) cancelarDirecto(id);
          }}
          onNotificarPago={(id) => {
            if(confirm('¿Confirmas que ya has realizado la transferencia?')) notificarPago.mutate(id);
          }}
          onSolicitarDevolucion={(id) => {
            if(confirm('Se enviará una solicitud al administrador. ¿Continuar?')) solicitarDevolucion.mutate(id);
          }}
          isNotificandoPago={notificarPago.isPending}
        />
      ))}

      {/* 2. El Modal de Modificación */}
      {reservaEditando && (
        <div className="modal-overlay" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Modificar Reserva</h2>
            <FormularioModificar 
              reservaOriginal={reservaEditando}
              isPending={false}
              onCancelar={() => setReservaEditando(null)}
              onGuardar={(data) => {
                const { habitacion, ...restoDatos } = data;
                solicitarMod({ id: reservaEditando.id, data: { ...restoDatos, idHabitacion: habitacion } });
                setReservaEditando(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 3. El Modal de Detalles externalizado */}
      {reservaDetalle && (
        <ModalDetalles 
          reserva={reservaDetalle} 
          onClose={() => setReservaDetalle(null)} 
        />
      )}
    </div>
  );
};

export const DashboardApp = ({ token }: { token: string }) => (
  <QueryProvider token={token}>
    <main style={{ padding: '1.5rem', background: '#f9fafb', minHeight: '100vh', borderRadius: '10px', marginBottom: '20px' }}>
      <h1 style={{ fontWeight: 800, marginBottom: '2rem' }}>Panel de Usuario</h1>
      <ReservationListContent />
    </main>
  </QueryProvider>
);