import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { FullReservation } from './ReservationList';

interface ModalProps {
  reserva: FullReservation;
  onClose: () => void;
}

/* * COMPONENTE: ModalDetalles
 * Propósito: Una ventana emergente completamente accesible que muestra 
 * los datos profundos del contrato y titular.
 */
export function ModalDetalles({ reserva, onClose }: ModalProps) {
  // Función para traducir el estado técnico a algo legible en el modal
  const traducirEstado = (estado: string) => {
    switch (estado) {
      case 'approved': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'finished': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return estado;
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo-detalles" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 id="modal-titulo-detalles" style={{ margin: 0 }}>Detalles Reserva #{reserva.id}</h2>
          <button onClick={onClose} aria-label="Cerrar ventana de detalles" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#9ca3af" aria-hidden="true" />
          </button>
        </header>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <section style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Información General</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}><strong>Titular:</strong><br/>{reserva.titular?.nombre || reserva.nombre} {reserva.titular?.apellido1 || reserva.apellido1}</p>
              <p style={{ margin: 0 }}><strong>Estado:</strong><br/><span style={{ fontWeight: 600 }}>{traducirEstado(reserva.status || 'pending')}</span></p>
              <p style={{ margin: 0 }}><strong>Entrada:</strong><br/>{format(new Date(reserva.fechaEntrada), "dd/MM/yyyy")}</p>
              <p style={{ margin: 0 }}><strong>Salida:</strong><br/>{format(new Date(reserva.fechaSalida), "dd/MM/yyyy")}</p>
              <p style={{ margin: 0 }}><strong>Personas:</strong><br/>{reserva.numPersonas || '-'}</p>
              <p style={{ margin: 0 }}><strong>Habitación:</strong><br/>{reserva.habitacion || '-'}</p>
            </div>
          </section>

          {reserva.contrato && (
            <section style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Datos del Contrato</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}><strong>Firma:</strong><br/>{format(new Date(reserva.contrato.fechaContrato), "dd/MM/yyyy")}</p>
                <p style={{ margin: 0 }}><strong>Precio Total:</strong><br/>{reserva.contrato.precioTotal}€</p>
                <p style={{ margin: 0 }}><strong>Método Pago:</strong><br/>{reserva.contrato.tipoPago}</p>
                <p style={{ margin: 0 }}><strong>Estado Pago:</strong><br/>
                   <span style={{ textTransform: 'capitalize', fontWeight: 600, color: reserva.contrato.estado === 'pagado' ? '#059669' : '#b45309' }}>
                     {reserva.contrato.estado}
                   </span>
                </p>
              </div>
            </section>
          )}
        </div>

        <button onClick={onClose} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#374151', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}