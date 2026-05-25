import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Euro, Trash2, X, AlertCircle, Check, XCircle } from 'lucide-react';
import { useAdmin } from './useAdmin';
import type { FullReservation } from '../dashboard/ReservationList';

/* * COMPONENTE: AdminTabReservas
 * Propósito: Muestra todas las reservas e incluye modales de revisión
 * para aceptar o rechazar los cambios solicitados por los clientes.
 */
const AdminTabReservas = ({ onCheckinSelect }: { onCheckinSelect: (r: FullReservation) => void }) => {
  const { reservas, mutations } = useAdmin();
  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  
  // NUEVO ESTADO: Para controlar el modal de revisión de modificaciones
  const [reservaRevisarMod, setReservaRevisarMod] = useState<FullReservation | null>(null);

  const formatearFecha = (f: string) => { try { return format(new Date(f), "dd/MM/yyyy"); } catch { return f; } };

  // Intentamos extraer los datos nuevos del JSON de forma segura
  let datosPropuestos: any = null;
  if (reservaRevisarMod?.datos_modificacion) {
      try { datosPropuestos = JSON.parse(reservaRevisarMod.datos_modificacion); } catch (e) {}
  }

  const manejarResolucion = (id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel') => {
      mutations.resolverSolicitud.mutate(
          { id, accion, tipo },
          { onSuccess: () => setReservaRevisarMod(null) } // Cerramos el modal al terminar
      );
  };

  return (
    <div className="fade-in">
      <h2 className="admin-text-semibold" style={{ marginBottom: '1.5rem' }}>Gestión de Reservas</h2>
      
      <div className="admin-table-container">
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
                    
                    {/* Alertas de Pagos */}
                    {res.status === 'pending' && (res.estado_pago === 'pendiente' || !res.estado_pago) && (
                       <span className="admin-alert-waiting" role="status">Esperando fondos</span>
                    )}
                    {res.status === 'pending' && res.estado_pago === 'notificado' && (
                       <span className="admin-alert-waiting" style={{ color: '#10b981' }} role="status">💰 Pago Notificado</span>
                    )}

                    {/* Alerta de Cancelación */}
                    {res.solicitud_cancelacion === 1 && (
                      <div className="alert-box alert-cancel" role="alert">
                        <div className="alert-title"> SOLICITUD ANULACIÓN</div>
                        <button 
                            onClick={() => manejarResolucion(res.id, 'accept', 'cancel')} 
                            className="btn-small accept-cancel"
                        >
                            Aceptar Anulación
                        </button>
                      </div>
                    )}

                    {/* NUEVO: Alerta de Modificación */}
                    {res.datos_modificacion && (
                      <div className="alert-box alert-warning" role="alert" >
                        <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={14} /> CAMBIOS PENDIENTES
                        </div>
                        <button 
                            onClick={() => setReservaRevisarMod(res)} 
                            className="btn-small-mod"
                        >
                            Revisar Cambios
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex-column-gap" role="group">
                    <button onClick={() => setReservaDetalle(res)} className="btn-action btn-outline">
                      <Eye size={14} /> + Info
                    </button>

                    {res.status === 'pending' && res.estado_pago === 'notificado' && (
                       <button onClick={() => { if(confirm('¿Confirmar ingreso?')) mutations.confirmarPagoYAprobar.mutate(res.id) }} className="btn-action btn-approve">
                         <Euro size={14} /> Confirmar Ingreso
                       </button>
                    )}

                    {res.status === 'approved' && !res.datos_modificacion && !res.solicitud_cancelacion && (
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

      {/* --- MODAL 1: INFO GENERAL (El que ya tenías) --- */}
      {reservaDetalle && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            {/* ... Aquí dentro va el contenido de tu modal original de detalles que ya funcionaba bien ... */}
            <div className="modal-card">
              <button onClick={() => setReservaDetalle(null)} className="modal-close-btn"><X size={24}/></button>
              <h2 className="modal-header">Detalles Reserva #{reservaDetalle.id}</h2>
              <p>Nombre: {reservaDetalle.titular?.nombre}</p>
              {/* Resto de detalles */}
              <button onClick={() => setReservaDetalle(null)} className="modal-footer-btn">Cerrar</button>
            </div>
        </div>
      )}

      {/* --- MODAL 2: REVISIÓN DE MODIFICACIONES --- */}
      {reservaRevisarMod && datosPropuestos && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo-revision">
          <div className="modal-card" style={{ maxWidth: '800px' }}>
            <button onClick={() => setReservaRevisarMod(null)} className="modal-close-btn"><X size={24}/></button>
            <h2 id="modal-titulo-revision" className="modal-header" style={{ color: '#b45309' }}>
              Revisar Solicitud de Modificación #{reservaRevisarMod.id}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              {/* Columna Izquierda: Datos Actuales */}
              <section style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ color: '#4b5563', marginBottom: '1rem', borderBottom: '2px solid #d1d5db', paddingBottom: '0.5rem' }}>
                  Datos Actuales (Aprobados)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <p><strong>Entrada:</strong> {formatearFecha(reservaRevisarMod.fechaEntrada)}</p>
                  <p><strong>Salida:</strong> {formatearFecha(reservaRevisarMod.fechaSalida)}</p>
                  <p><strong>Personas:</strong> {reservaRevisarMod.numPersonas}</p>
                  <p><strong>Titular:</strong> {reservaRevisarMod.titular?.nombre} {reservaRevisarMod.titular?.apellido1}</p>
                  <p><strong>DNI/Pasaporte:</strong> {reservaRevisarMod.titular?.numeroDocumento}</p>
                </div>
              </section>

              {/* Columna Derecha: Datos Nuevos */}
              <section style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <h4 style={{ color: '#b45309', marginBottom: '1rem', borderBottom: '2px solid #fcd34d', paddingBottom: '0.5rem' }}>
                  Cambios Solicitados
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <p>
                    <strong>Entrada:</strong>{' '}
                    <span style={{ color: datosPropuestos.fechaEntrada !== reservaRevisarMod.fechaEntrada ? '#b45309' : 'inherit', fontWeight: datosPropuestos.fechaEntrada !== reservaRevisarMod.fechaEntrada ? 'bold' : 'normal' }}>
                      {formatearFecha(datosPropuestos.fechaEntrada)}
                    </span>
                  </p>
                  <p>
                    <strong>Salida:</strong>{' '}
                    <span style={{ color: datosPropuestos.fechaSalida !== reservaRevisarMod.fechaSalida ? '#b45309' : 'inherit', fontWeight: datosPropuestos.fechaSalida !== reservaRevisarMod.fechaSalida ? 'bold' : 'normal' }}>
                      {formatearFecha(datosPropuestos.fechaSalida)}
                    </span>
                  </p>
                  <p>
                    <strong>Personas:</strong>{' '}
                    <span style={{ color: datosPropuestos.numPersonas !== reservaRevisarMod.numPersonas ? '#b45309' : 'inherit' }}>
                      {datosPropuestos.numPersonas}
                    </span>
                  </p>
                  <p>
                    <strong>Titular:</strong>{' '}
                    <span style={{ color: datosPropuestos.titular?.nombre !== reservaRevisarMod.titular?.nombre ? '#b45309' : 'inherit' }}>
                      {datosPropuestos.titular?.nombre} {datosPropuestos.titular?.apellido1}
                    </span>
                  </p>
                  <p>
                    <strong>DNI/Pasaporte:</strong>{' '}
                    <span style={{ color: datosPropuestos.titular?.numeroDocumento !== reservaRevisarMod.titular?.numeroDocumento ? '#b45309' : 'inherit' }}>
                      {datosPropuestos.titular?.numeroDocumento}
                    </span>
                  </p>
                </div>
              </section>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => manejarResolucion(reservaRevisarMod.id, 'reject', 'mod')}
                className="btn-action btn-danger-soft"
                style={{ flex: 1, padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}
                disabled={mutations.resolverSolicitud.isPending}
              >
                <XCircle size={18} /> Rechazar Cambios
              </button>
              
              <button 
                onClick={() => manejarResolucion(reservaRevisarMod.id, 'accept', 'mod')}
                className="btn-action btn-approve"
                style={{ flex: 1, padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}
                disabled={mutations.resolverSolicitud.isPending}
              >
                <Check size={18} /> Aprobar y Sobrescribir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTabReservas;