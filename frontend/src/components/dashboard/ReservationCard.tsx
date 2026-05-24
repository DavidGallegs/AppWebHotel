import { format, differenceInHours } from 'date-fns';
import { 
  Clock, CheckCircle2, XCircle, CalendarCheck, 
  CalendarDays, Eye, Edit, Trash2, Users, AlertCircle, Check, Euro
} from 'lucide-react';
import type { FullReservation } from './ReservationList';

// Configuración visual de los estados (Colores e Iconos)
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
  res, onVerDetalles, onModificar, onCancelar, onNotificarPago, onSolicitarDevolucion, onCheckin, isNotificandoPago 
}: CardProps) {

  // Variables lógicas de lectura fácil para determinar el estado
  const estadoActual = res.status || 'pending';
  const config = statusConfig[estadoActual as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const esAprobada = estadoActual === 'approved';
  const esPendiente = estadoActual === 'pending';
  const esFinalizada = estadoActual === 'finished';
  
  const tieneSolicitudMod = res.datos_modificacion !== null && res.datos_modificacion !== undefined;
  const tieneSolicitudCancel = res.solicitud_cancelacion === 1;

  /* * Lógica: Ventana de Check-in
   * Comprueba si el usuario está a 48h o menos de entrar al hotel 
   * y mantiene el checkin abierto hasta 24h después.
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
    <article className="reserva-card" aria-label={`Reserva de ${nombreAMostrar}`}>
      
      {/* --- CABECERA DE LA TARJETA --- */}
      <header className="reserva-card-header">
        <div>
          <h3 className="reserva-card-title">{nombreAMostrar} {apellidoAMostrar}</h3>
          <div className="reserva-card-dates">
            <CalendarDays size={14} aria-hidden="true" />
            <span>{format(new Date(res.fechaEntrada), "dd/MM/yyyy")} - {format(new Date(res.fechaSalida), "dd/MM/yyyy")}</span>
          </div>
        </div>
        
        {/* Etiqueta de estado: Único elemento con estilos en línea por depender de JS */}
        <div className="reserva-badge" aria-label={`Estado actual: ${config.label}`} style={{ backgroundColor: config.bg, color: config.color }}>
          <StatusIcon size={16} aria-hidden="true" />
          <span>{config.label}</span>
        </div>
      </header>

      {/* --- ALERTAS DE ESTADO DE PAGO Y REVISIÓN --- */}
      {esPendiente && res.estado_pago === 'pendiente' && (
        <div role="alert" className="alert-warning">
          <div className="alert-text-warning">
            <AlertCircle size={18} aria-hidden="true" />
            <span><strong>Acción requerida:</strong> Por favor, realiza la transferencia bancaria.</span>
          </div>
          <button 
            className="btn-notify"
            onClick={() => onNotificarPago(res.id)}
            disabled={isNotificandoPago}
          >
            {isNotificandoPago ? 'Notificando...' : 'Ya he pagado'}
          </button>
        </div>
      )}

      {esPendiente && res.estado_pago === 'notificado' && (
        <div role="status" className="status-info">
          <Check size={16} aria-hidden="true" />
          <span>Pago notificado. Verificando transferencia.</span>
        </div>
      )}

      {(tieneSolicitudMod || tieneSolicitudCancel || res.estado_pago === 'devolucion_solicitada') && (
        <div role="status" className="status-review">
          <AlertCircle size={16} aria-hidden="true" />
          <span>Solicitud en revisión por el administrador.</span>
        </div>
      )}

      {/* --- BOTONERA DE ACCIONES INTERACTIVAS --- */}
      <div className="reserva-card-actions">
        
        <button className="btn btn-ver" onClick={() => onVerDetalles(res)}>
          <Eye size={16} aria-hidden="true" /> + Info
        </button>

        {/* Botones para reservas Pendientes */}
        {esPendiente && (
          <>
            <button className="btn btn-modificar" onClick={() => onModificar(res)}>
              <Edit size={16} aria-hidden="true" /> Modificar
            </button>
            
            {(res.estado_pago === 'pendiente' || !res.estado_pago) && (
              <button className="btn btn-cancelar ml-auto" onClick={() => onCancelar(res.id)}>
                <Trash2 size={16} aria-hidden="true" /> Cancelar
              </button>
            )}
            
            {res.estado_pago === 'notificado' && !tieneSolicitudCancel && (
              <button className="btn btn-cancelar ml-auto" onClick={() => onCancelar(res.id)}>
                <XCircle size={16} className="icon-inline" aria-hidden="true" /> Deshacer y Cancelar
              </button>
            )}
          </>
        )}

        {/* Botones para reservas Aprobadas/Confirmadas */}
        {esAprobada && !tieneSolicitudMod && !tieneSolicitudCancel && res.estado_pago !== 'devolucion_solicitada' && (
          <>
            <button className="btn btn-modificar" onClick={() => onModificar(res)}>
              Solicitar Cambio
            </button>
            
            <button className="btn btn-cancelar ml-auto" onClick={() => onSolicitarDevolucion(res.id)}>
              <Euro size={16} className="icon-inline" aria-hidden="true" /> Solicitar Anulación
            </button>

            {/* Renderizado condicional del botón de Check-in (últimas 48 horas) */}
            {puedeHacerCheckin && (
              <div className="checkin-wrapper">
                <button className="btn-viajeros" onClick={() => onCheckin(res)}>
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