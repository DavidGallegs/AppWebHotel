import { format, differenceInHours } from 'date-fns';
import { 
  Clock, CheckCircle2, XCircle, CalendarCheck, 
  CalendarDays, Eye, Edit, Trash2, Users, AlertCircle, Check, Euro
} from 'lucide-react';
import type { FullReservation } from './ReservationList';

// Mantenemos la configuración visual aquí dentro, ya que solo la usa la tarjeta
const statusConfig = {
  pending: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7', icon: Clock },
  approved: { label: 'Confirmada', color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle2 },
  finished: { label: 'Finalizada', color: '#047857', bg: '#d1fae5', icon: CalendarCheck },
  cancelled: { label: 'Cancelada', color: '#be123c', bg: '#ffe4e6', icon: XCircle },
};

interface CardProps {
  res: FullReservation;
  onVerDetalles: (res: FullReservation) => void;
  onModificar: (res: FullReservation) => void;
  onCancelar: (id: string | number) => void;
  onNotificarPago: (id: string | number) => void;
  onSolicitarDevolucion: (id: string | number) => void;
  onCheckin: (res: FullReservation) => void;
  isNotificandoPago: boolean;
}

/* * COMPONENTE: ReservationCard
 * Propósito: Muestra el resumen de una única reserva y decide qué botones mostrar 
 * basándose en el estado de la reserva y del pago.
 */
export function ReservationCard({ 
  res, onVerDetalles, onModificar, onCancelar, onNotificarPago, onSolicitarDevolucion, onCheckin,isNotificandoPago 
}: CardProps) {

  // Variables lógicas de lectura fácil
  const estadoActual = res.status || 'pending';
  const config = statusConfig[estadoActual as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const esAprobada = estadoActual === 'approved';
  const esPendiente = estadoActual === 'pending';
  const esFinalizada = estadoActual === 'finished';
  
  const tieneSolicitudMod = res.datos_modificacion !== null && res.datos_modificacion !== undefined;
  const tieneSolicitudCancel = res.solicitud_cancelacion === 1;

  /* * Lógica: Ventana de Check-in
   * Comprueba si el usuario está a 48h o menos de entrar al hotel.
   */
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
  
  const puedeHacerCheckin = esAprobada && verificarVentanaCheckin(res.fechaEntrada);
  const nombreAMostrar = res.titular?.nombre || res.nombre || 'Reserva';
  const apellidoAMostrar = res.titular?.apellido1 || res.apellido1 || '';

  return (
    <article className="reserva-card" aria-label={`Reserva de ${nombreAMostrar}`} style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem',
      padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{nombreAMostrar} {apellidoAMostrar}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginTop: '4px' }}>
            <CalendarDays size={14} aria-hidden="true" />
            <span>{format(new Date(res.fechaEntrada), "dd/MM/yyyy")} - {format(new Date(res.fechaSalida), "dd/MM/yyyy")}</span>
          </div>
        </div>
        <div aria-label={`Estado actual: ${config.label}`} style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', 
          borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: config.bg, color: config.color 
        }}>
          <StatusIcon size={16} aria-hidden="true" />
          <span>{config.label}</span>
        </div>
      </header>

      {/* --- ALERTAS DE ESTADO --- */}
      {esPendiente && res.estado_pago === 'pendiente' && (
        <div role="alert" style={{ marginTop: '1rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.9rem' }}>
            <AlertCircle size={18} aria-hidden="true" />
            <span><strong>Acción requerida:</strong> Por favor, realiza la transferencia bancaria.</span>
          </div>
          <button 
            onClick={() => onNotificarPago(res.id)}
            disabled={isNotificandoPago}
            style={{ background: '#b45309', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            {isNotificandoPago ? 'Notificando...' : 'Ya he pagado'}
          </button>
        </div>
      )}

      {esPendiente && res.estado_pago === 'notificado' && (
        <div role="status" style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '0.85rem' }}>
          <Check size={16} aria-hidden="true" />
          <span>Pago notificado. Verificando transferencia.</span>
        </div>
      )}

      {(tieneSolicitudMod || tieneSolicitudCancel || res.estado_pago === 'devolucion_solicitada') && (
        <div role="status" style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#9a3412', fontSize: '0.85rem' }}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>Solicitud en revisión por el administrador.</span>
        </div>
      )}

      {/* --- BOTONERA --- */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
        
        <button className="btn btn-ver" onClick={() => onVerDetalles(res)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', background: 'white' }}>
          <Eye size={16} aria-hidden="true" /> + Info
        </button>

        {esPendiente && (
          <>
            <button className="btn btn-modificar" onClick={() => onModificar(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <Edit size={16} aria-hidden="true" /> Modificar
            </button>
            
            {(res.estado_pago === 'pendiente' || !res.estado_pago) && (
              <button className="btn btn-cancelar" onClick={() => onCancelar(res.id)} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                <Trash2 size={16} aria-hidden="true" /> Cancelar
              </button>
            )}
            
            {res.estado_pago === 'notificado' && !tieneSolicitudCancel && (
              <button className="btn btn-cancelar" onClick={() => onCancelar(res.id)} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                <XCircle size={16} style={{display: 'inline', marginBottom: '-3px'}} aria-hidden="true" /> Deshacer y Cancelar
              </button>
            )}
          </>
        )}

        {esAprobada && !tieneSolicitudMod && !tieneSolicitudCancel && res.estado_pago !== 'devolucion_solicitada' && (
          <>
            <button className="btn btn-modificar" onClick={() => onModificar(res)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              Solicitar Cambio
            </button>
            
            <button onClick={() => onSolicitarDevolucion(res.id)} style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
              <Euro size={16} style={{display: 'inline', marginBottom: '-3px'}} aria-hidden="true" /> Solicitar Anulacion
            </button>

            {puedeHacerCheckin && (
              <div style={{ width: '100%', marginTop: '0.5rem' }}>
                {/* SOLUCIÓN: Le añadimos un onClick provisional para probar si es una redirección o un Modal */}
                <button 
                  className="btn-viajeros" 
                  onClick={() => onCheckin(res)} 
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}
                >
                  <Users size={18} aria-hidden="true" /> REALIZAR CHECK-IN ONLINE
              </button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}