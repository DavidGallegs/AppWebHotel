import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  useReservations, 
  useCancelReservation, 
  useRequestModification 
} from './useReservations';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, CheckCircle2, XCircle, CalendarCheck, 
  CalendarDays, Eye, Edit, Trash2, Users, AlertCircle, X, Check, Euro
} from 'lucide-react';
import type { Reservation } from './reservation';
import { QueryProvider } from './QueryProvider'; 
import { FormularioModificar } from './FormularioModificar';
import { api } from './api'; 

export interface FullReservation extends Reservation {
  habitacion?: string;
  numPersonas?: number;
  numHabitaciones?: number;
  solicitud_cancelacion: number;
  datos_modificacion: string | null;
  estado_pago?: 'pendiente' | 'notificado' | 'pagado' | 'devolucion_solicitada'; 
  contrato?: {
    fechaContrato: string;
    internet: boolean;
    tipoPago: string;
    fechaPago: string;
    precioTotal: number;
    estado: string;
  };
  titular?: {
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    fechaNacimiento?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    soporteDocumento?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    codigoPostal?: string;
    nombreMunicipio?: string;
    codigoMunicipio?: string;
    pais?: string;
  };
}

const statusConfig = {
  pending: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7', icon: Clock },
  approved: { label: 'Confirmada', color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle2 },
  finished: { label: 'Finalizada', color: '#047857', bg: '#d1fae5', icon: CalendarCheck },
  cancelled: { label: 'Cancelada', color: '#be123c', bg: '#ffe4e6', icon: XCircle },
};

const ReservationListContent = () => {
  const queryClient = useQueryClient();
  const { data: reservations, isLoading, isError } = useReservations();
  const { mutate: cancelarDirecto } = useCancelReservation();
  const { mutate: solicitarMod } = useRequestModification();

  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  const [reservaEditando, setReservaEditando] = useState<FullReservation | null>(null);

  // MUTACIONES PARA PAGOS Y DEVOLUCIONES
  const notificarPago = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/reservations/${id}/notificar-pago`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      alert("¡Gracias! Hemos notificado al administrador.");
    }
  });

  const solicitarDevolucion = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/reservations/${id}/solicitar-devolucion`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      alert("Solicitud de anulación y devolución enviada correctamente.");
    }
  });

  if (isLoading) return <div className="p-4">Cargando tus reservas...</div>;
  if (isError) return <div className="p-4 text-red-500">Error al conectar con el servidor.</div>;

  const verificarVentanaCheckin = (fechaEntrada: string) => {
    try {
      const ahora = new Date();
      const entrada = new Date(fechaEntrada);
      const horasParaEntrada = differenceInHours(entrada, ahora);
      return horasParaEntrada <= 48 && horasParaEntrada >= -24; 
    } catch {
      return false;
    }
  };

  return (
    <div className="reserva-list-container">
      {reservations?.map((res: FullReservation) => {
        const estadoActual = res.status || 'pending';
        const config = statusConfig[estadoActual as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = config.icon;

        const esAprobada = estadoActual === 'approved';
        const esPendiente = estadoActual === 'pending';
        const esFinalizada = estadoActual === 'finished';
        
        const tieneSolicitudMod = res.datos_modificacion !== null && res.datos_modificacion !== undefined;
        const tieneSolicitudCancel = res.solicitud_cancelacion === 1;
        const puedeHacerCheckin = esAprobada && verificarVentanaCheckin(res.fechaEntrada);

        const nombreAMostrar = res.titular?.nombre || res.nombre || 'Reserva';
        const apellidoAMostrar = res.titular?.apellido1 || res.apellido1 || '';

        return (
          <div key={res.id} className="reserva-card" style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem',
            padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{nombreAMostrar} {apellidoAMostrar}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginTop: '4px' }}>
                  <CalendarDays size={14} />
                  <span>{format(new Date(res.fechaEntrada), "dd/MM/yyyy")} - {format(new Date(res.fechaSalida), "dd/MM/yyyy")}</span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', 
                borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                backgroundColor: config.bg, color: config.color 
              }}>
                <StatusIcon size={16} />
                <span>{config.label}</span>
              </div>
            </div>

            {/* ALERTAS DE PAGOS */}
            {esPendiente && res.estado_pago === 'pendiente' && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span><strong>Acción requerida:</strong> Por favor, realiza la transferencia bancaria (ver instrucciones en tu email).</span>
                </div>
                <button 
                  onClick={() => { if(confirm('¿Confirmas que ya has realizado la transferencia?')) notificarPago.mutate(res.id) }}
                  disabled={notificarPago.isPending}
                  style={{ background: '#b45309', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {notificarPago.isPending ? 'Notificando...' : 'Ya he pagado'}
                </button>
              </div>
            )}

            {esPendiente && res.estado_pago === 'notificado' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '0.85rem' }}>
                <Check size={16} />
                <span>Pago notificado. Estamos verificando la transferencia para confirmar tu reserva en breve.</span>
              </div>
            )}

            {(tieneSolicitudMod || tieneSolicitudCancel || res.estado_pago === 'devolucion_solicitada') && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#9a3412', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Tu solicitud {res.estado_pago === 'devolucion_solicitada' ? 'de anulación y devolución' : 'de modificación'} está siendo revisada por el administrador.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-ver" 
                onClick={() => setReservaDetalle(res)} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', background: 'white' }}
              >
                <Eye size={16} /> + Info
              </button>

              {esPendiente && (
                <>
                  <button className="btn btn-modificar" onClick={() => setReservaEditando(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                    <Edit size={16} /> Modificar
                  </button>
                  {/* Si no ha pagado, cancelación normal */}
                  {(res.estado_pago === 'pendiente' || !res.estado_pago) && (
                    <button className="btn btn-cancelar" onClick={() => { if(confirm('¿Seguro que quieres cancelar la reserva?')) cancelarDirecto(res.id) }} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                      <Trash2 size={16} /> Cancelar
                    </button>
                  )}
                  {/* Si ya notificó el pago, pide devolución */}
                  {res.estado_pago === 'notificado' && !tieneSolicitudCancel && (
                    <button onClick={() => { if(confirm('Se enviará una solicitud de anulación y devolución al administrador. ¿Continuar?')) solicitarDevolucion.mutate(res.id) }} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                      <Euro size={16} style={{display: 'inline', marginBottom: '-3px'}}/> Anular y Pedir Devolución
                    </button>
                  )}
                </>
              )}

              {esAprobada && !tieneSolicitudMod && !tieneSolicitudCancel && res.estado_pago !== 'devolucion_solicitada' && (
                <>
                  {!puedeHacerCheckin ? (
                    <>
                      <button className="btn btn-modificar" onClick={() => setReservaEditando(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                        Solicitar Cambio
                      </button>
                      <button onClick={() => { if(confirm('Se enviará una solicitud de anulación y devolución de tu dinero. ¿Continuar?')) solicitarDevolucion.mutate(res.id) }} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                        <Euro size={16} style={{display: 'inline', marginBottom: '-3px'}}/> Anular y Pedir Devolución
                      </button>
                    </>
                  ) : (
                    <button className="btn-viajeros" style={{ background: '#059669', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%', marginTop: '0.5rem' }}>
                      <Users size={18} /> REALIZAR CHECK-IN ONLINE
                    </button>
                  )}
                </>
              )}

              {esFinalizada && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600, fontSize: '0.9rem', marginLeft: 'auto' }}>
                  <CheckCircle2 size={18} /> Check-in completado.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* MODAL DE EDICIÓN */}
      {reservaEditando && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{reservaEditando.status === 'approved' ? 'Solicitar Modificación' : 'Modificar Reserva'}</h2>
            <FormularioModificar 
              reservaOriginal={reservaEditando}
              isPending={false}
              onCancelar={() => setReservaEditando(null)}
              onGuardar={(data) => {
                if(reservaEditando.status === 'pending') {
                  // Si tienes endpoint de editar directo para pendientes ponlo aquí, sino usa solicitarMod
                  solicitarMod({ id: reservaEditando.id, data });
                } else {
                  solicitarMod({ id: reservaEditando.id, data });
                }
                setReservaEditando(null);
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {reservaDetalle && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Detalles Reserva #{reservaDetalle.id}</h2>
              <button onClick={() => setReservaDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#9ca3af" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Información General</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Titular:</strong><br/>
                    {reservaDetalle.titular?.nombre || reservaDetalle.nombre} {reservaDetalle.titular?.apellido1 || reservaDetalle.apellido1}
                  </p>
                  <p style={{ margin: 0 }}><strong>Estado:</strong><br/>
                    <span style={{ color: statusConfig[reservaDetalle.status || 'pending']?.color, fontWeight: 600 }}>
                      {statusConfig[reservaDetalle.status || 'pending']?.label}
                    </span>
                  </p>
                  <p style={{ margin: 0 }}><strong>Entrada:</strong><br/>{format(new Date(reservaDetalle.fechaEntrada), "dd/MM/yyyy")}</p>
                  <p style={{ margin: 0 }}><strong>Salida:</strong><br/>{format(new Date(reservaDetalle.fechaSalida), "dd/MM/yyyy")}</p>
                  <p style={{ margin: 0 }}><strong>Personas:</strong><br/>{reservaDetalle.numPersonas || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Habitación:</strong><br/>{reservaDetalle.habitacion || '-'}</p>
                </div>
              </div>

              {reservaDetalle.contrato && (
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Datos del Contrato</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}><strong>Firma:</strong><br/>{format(new Date(reservaDetalle.contrato.fechaContrato), "dd/MM/yyyy")}</p>
                    <p style={{ margin: 0 }}><strong>Precio Total:</strong><br/>{reservaDetalle.contrato.precioTotal}€</p>
                    <p style={{ margin: 0 }}><strong>Método Pago:</strong><br/>{reservaDetalle.contrato.tipoPago}</p>
                    <p style={{ margin: 0 }}><strong>Estado Pago:</strong><br/>
                       <span style={{ 
                         textTransform: 'capitalize', 
                         fontWeight: 600, 
                         color: reservaDetalle.contrato.estado === 'pagado' ? '#059669' : '#b45309' 
                       }}>
                         {reservaDetalle.contrato.estado}
                       </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setReservaDetalle(null)}
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#374151', color: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DashboardApp = ({ token }: { token: string }) => (
  <QueryProvider token={token}>
    <div style={{ padding: '1.5rem', background: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 800, marginBottom: '2rem' }}>Panel de Usuario</h1>
      <ReservationListContent />
    </div>
  </QueryProvider>
);