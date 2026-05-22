import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Euro, Trash2, X } from 'lucide-react';
import { useAdmin } from './useAdmin';
import type { FullReservation } from '../dashboard/ReservationList';

/* * COMPONENTE: AdminTabReservas
 * Propósito: Muestra todas las reservas. Desde aquí el administrador puede 
 * aprobar pagos, anular, o lanzar el flujo de Check-in.
 */
const AdminTabReservas = ({ onCheckinSelect }: { onCheckinSelect: (r: FullReservation) => void }) => {
  const { reservas, mutations } = useAdmin();
  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);

  const formatearFecha = (f: string) => { try { return format(new Date(f), "dd/MM/yyyy"); } catch { return f; } };

  return (
    <div className="fade-in">
      <h2 className="admin-text-semibold" style={{ marginBottom: '1.5rem' }}>Gestión de Reservas</h2>
      
      <div className="admin-table-container">
        {/* Accesibilidad para tablas de datos */}
        <table className="admin-table" aria-label="Listado general de reservas">
          <thead>
            <tr>
              <th scope="col">ID / Titular</th>
              <th scope="col">Fechas</th>
              <th scope="col">Estado / Alertas</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas?.map((res: FullReservation) => (
              <tr key={res.id}>
                <td>
                  <div className="admin-text-semibold">{res.titular?.nombre || res.nombre} {res.titular?.apellido1 || res.apellido1}</div>
                  <div className="admin-text-muted">ID: #{res.id} | Hab: {res.habitacion || '1'}</div>
                </td>
                <td>{formatearFecha(res.fechaEntrada)} - {formatearFecha(res.fechaSalida)}</td>
                <td>
                  <div className="flex-column-gap">
                    <span className={`badge badge-${res.status}`}>{res.status}</span>
                    
                    {res.status === 'pending' && (res.estado_pago === 'pendiente' || !res.estado_pago) && (
                       <span className="admin-alert-waiting" role="status">Esperando fondos</span>
                    )}

                    {res.status === 'pending' && res.estado_pago === 'notificado' && (
                       <span className="admin-alert-waiting" style={{ color: '#10b981' }} role="status">💰 Pago Notificado</span>
                    )}

                    {res.solicitud_cancelacion === 1 && (
                      <div className="alert-box alert-cancel" role="alert">
                        <div className="alert-title"> SOLICITUD ANULACIÓN</div>
                        <button 
                            onClick={() => mutations.resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} 
                            className="btn-small accept-cancel"
                            aria-label={`Aceptar anulación de reserva ${res.id}`}
                        >
                            Aceptar
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex-column-gap" role="group" aria-label="Acciones de reserva">
                    <button onClick={() => setReservaDetalle(res)} className="btn-action btn-outline" aria-label="Ver detalles">
                      <Eye size={14} aria-hidden="true" /> + Info
                    </button>

                    {res.status === 'pending' && res.estado_pago === 'notificado' && (
                       <button 
                         onClick={() => { if(confirm('¿Confirmar ingreso bancario y aprobar reserva?')) mutations.confirmarPagoYAprobar.mutate(res.id) }} 
                         className="btn-action btn-approve"
                         aria-label="Confirmar recepción del dinero"
                       >
                         <Euro size={14} aria-hidden="true" /> Confirmar Ingreso
                       </button>
                    )}

                    {res.status === 'approved' && (
                       <button onClick={() => onCheckinSelect(res)} className="btn-action btn-checkin" aria-label="Realizar check in">Check-in</button>
                    )}

                    <button onClick={() => { if(confirm('¿Anular?')) mutations.cancelarReservaAdmin.mutate(res.id) }} className="btn-action btn-danger-soft" aria-label="Anular reserva">
                      <Trash2 size={14} aria-hidden="true" /> Anular
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES ACCESIBLE */}
      {reservaDetalle && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={`modal-title-${reservaDetalle.id}`}>
          <div className="modal-card">
            <button onClick={() => setReservaDetalle(null)} className="modal-close-btn" aria-label="Cerrar ventana"><X size={24} aria-hidden="true" /></button>
            <h2 id={`modal-title-${reservaDetalle.id}`} className="modal-header">Detalles Reserva #{reservaDetalle.id}</h2>

            <div className="modal-grid">
              <section>
                <h4 className="modal-section-title admin-text-accent">Huésped Titular</h4>
                <p><strong>Nombre:</strong> {reservaDetalle.titular?.nombre} {reservaDetalle.titular?.apellido1}</p>
                <p><strong>Teléfono:</strong> {reservaDetalle.titular?.telefono || '-'}</p>
                <p><strong>Email:</strong> {reservaDetalle.titular?.correo || '-'}</p>
              </section>

              <section className="modal-info-box">
                <h4 className="modal-section-title">Estancia</h4>
                <div className="grid-2-col">
                  <p><strong>Hab:</strong> {reservaDetalle.habitacion || '1'}</p>
                  <p><strong>Pax:</strong> {reservaDetalle.numPersonas}</p>
                  <p><strong>Entrada:</strong> {formatearFecha(reservaDetalle.fechaEntrada)}</p>
                  <p><strong>Salida:</strong> {formatearFecha(reservaDetalle.fechaSalida)}</p>
                </div>
              </section>
            </div>

            <button onClick={() => setReservaDetalle(null)} className="modal-footer-btn">Cerrar Detalles</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTabReservas;