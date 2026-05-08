import { useState } from 'react';
import { 
  useReservations, 
  useCancelReservation, 
  useRequestModification, 
  useRequestCancellation 
} from './useReservations';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, CheckCircle2, XCircle, CalendarCheck, 
  CalendarDays, Eye, Edit, Trash2, Users, AlertCircle 
} from 'lucide-react';
import type { Reservation } from './reservation';
import { QueryProvider } from './QueryProvider'; 
import { FormularioModificar } from './FormularioModificar';

export interface FullReservation extends Reservation {
  habitacion?: string;
  numPersonas?: number;
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
  const { data: reservations, isLoading, isError } = useReservations();
  const { mutate: cancelarDirecto } = useCancelReservation();
  const { mutate: solicitarMod } = useRequestModification();
  const { mutate: solicitarCancel } = useRequestCancellation();

  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  const [reservaEditando, setReservaEditando] = useState<FullReservation | null>(null);

  if (isLoading) return <div className="p-4">Cargando tus reservas...</div>;
  if (isError) return <div className="p-4 text-red-500">Error al conectar con el servidor.</div>;

  const verificarVentanaCheckin = (fechaEntrada: string) => {
    const ahora = new Date();
    const entrada = new Date(fechaEntrada);
    const horasParaEntrada = differenceInHours(entrada, ahora);
    return horasParaEntrada <= 48 && horasParaEntrada >= -24; 
  };

  return (
    <div className="reserva-list-container">
      {reservations?.map((res: FullReservation) => {
        const config = statusConfig[res.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const esAprobada = res.status === 'approved';
        const esPendiente = res.status === 'pending';
        const esFinalizada = res.status === 'finished';
        const tieneSolicitudMod = res.datos_modificacion !== null;
        const tieneSolicitudCancel = res.solicitud_cancelacion === 1;
        const puedeHacerCheckin = esAprobada && verificarVentanaCheckin(res.fechaEntrada);

        return (
          <div key={res.id} className="reserva-card" style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem',
            padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{res.nombre} {res.apellido1}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem' }}>
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

            {(tieneSolicitudMod || tieneSolicitudCancel) && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#9a3412', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Tu solicitud de {tieneSolicitudCancel ? 'anulación' : 'modificación'} está siendo revisada por el administrador.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
              <button className="btn btn-ver" onClick={() => setReservaDetalle(res)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }}>
                <Eye size={16} /> + Info
              </button>

              {esPendiente && (
                <>
                  <button className="btn btn-modificar" onClick={() => setReservaEditando(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
                    <Edit size={16} /> Modificar
                  </button>
                  <button className="btn btn-cancelar" onClick={() => { if(confirm('¿Seguro que quieres cancelar la reserva?')) cancelarDirecto(res.id) }} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
                    <Trash2 size={16} /> Cancelar
                  </button>
                </>
              )}

              {esAprobada && !tieneSolicitudMod && !tieneSolicitudCancel && (
                <>
                  {!puedeHacerCheckin ? (
                    <>
                      <button className="btn btn-modificar" onClick={() => setReservaEditando(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Solicitar Cambio
                      </button>
                      <button className="btn btn-cancelar" onClick={() => { if(confirm('Se enviará una solicitud de anulación al administrador. ¿Continuar?')) solicitarCancel(res.id) }} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
                        Solicitar Anulación
                      </button>
                    </>
                  ) : (
                    <button className="btn-viajeros" style={{ background: '#059669', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                      <Users size={18} /> REALIZAR CHECK-IN ONLINE
                    </button>
                  )}
                </>
              )}

              {esFinalizada && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} /> Check-in completado. ¡Buen viaje!
                </div>
              )}
            </div>
          </div>
        );
      })}

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
                  // Lógica de update directo
                } else {
                  solicitarMod({ id: reservaEditando.id, data });
                }
                setReservaEditando(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const DashboardApp = ({ token }: { token: string }) => (
  <QueryProvider token={token}>
    <div style={{ padding: '1.5rem', background: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 800, marginBottom: '2rem' }}>Mis Reservas</h1>
      <ReservationListContent />
    </div>
  </QueryProvider>
);