import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Euro, Trash2, X } from 'lucide-react';
import { useAdmin } from './useAdmin';
import type { FullReservation } from '../dashboard/ReservationList';

const AdminTabReservas = ({ onCheckinSelect }: { onCheckinSelect: (r: FullReservation) => void }) => {
  const { reservas, mutations } = useAdmin();
  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);

  const formatearFecha = (f: string) => { try { return format(new Date(f), "dd/MM/yyyy"); } catch { return f; } };

  return (
    <div className="fade-in">
      <h2 className="admin-text-semibold" style={{ marginBottom: '1.5rem' }}>Gestión de Reservas</h2>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID / Titular</th>
              <th>Fechas</th>
              <th>Estado / Alertas</th>
              <th>Acciones</th>
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
                       <span className="admin-alert-waiting">⏳ Esperando fondos</span>
                    )}

                    {res.solicitud_cancelacion === 1 && (
                      <div className="alert-box alert-cancel">
                        <div className="alert-title">🚨 SOLICITUD ANULACIÓN</div>
                        <button onClick={() => mutations.resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} className="btn-small accept-cancel">Aceptar</button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex-column-gap">
                    <button onClick={() => setReservaDetalle(res)} className="btn-action btn-outline">
                      <Eye size={14} /> + Info
                    </button>
                    {res.status === 'approved' && (
                       <button onClick={() => onCheckinSelect(res)} className="btn-action btn-checkin">Check-in</button>
                    )}
                    <button onClick={() => { if(confirm('¿Anular?')) mutations.cancelarReservaAdmin.mutate(res.id) }} className="btn-action btn-danger-soft">
                      <Trash2 size={14} /> Anular
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES LIMPIO */}
      {reservaDetalle && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button onClick={() => setReservaDetalle(null)} className="modal-close-btn"><X size={24} /></button>
            <h2 className="modal-header">Detalles Reserva #{reservaDetalle.id}</h2>

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