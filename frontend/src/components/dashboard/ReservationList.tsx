import { useState } from 'react';
import { useReservations, useCancelReservation, useUpdateReservation } from './useReservations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle2, XCircle, CalendarCheck, CalendarDays, Eye, Edit, Trash2, Users } from 'lucide-react';
import type { Reservation, ReservationStatus } from './reservation';
import { QueryProvider } from './QueryProvider'; 

import { FormularioModificar } from './FormularioModificar';
import type { TReserva } from '../formularios/reservaHotel/esquemaReserva';

export interface FullReservation extends Reservation {
  habitacion?: string;
  numPersonas?: number;
  titular?: {
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    codigoPostal?: string;
    nombreMunicipio?: string;
    codigoMunicipio?: string;
    pais?: string;
  };
}

const estilosGlobales = `
  .reserva-card {
    background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem;
    padding: 1.25rem; margin-bottom: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; gap: 1rem;
  }
  .reserva-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .reserva-titulo { margin: 0; font-size: 1.125rem; font-weight: 700; color: #1f2937; }
  .reserva-fecha { display: flex; align-items: center; gap: 0.5rem; color: #4b5563; font-size: 0.875rem; }
  .status-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
  .reserva-acciones { display: flex; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
  
  .btn { display: flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer; }
  .btn-ver { background: #f3f4f6; color: #374151; }
  .btn-modificar { background: #eff6ff; color: #1d4ed8; }
  .btn-viajeros { background: #ecfdf5; color: #047857; }
  .btn-cancelar { background: #fff1f2; color: #be123c; margin-left: auto; }

  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    z-index: 50; padding: 1rem;
  }
  .modal-container { background: white; border-radius: 1rem; width: 100%; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #eee; background: #fafafa; }
  .modal-body { padding: 1.5rem; }
  .modal-footer { padding: 1rem 1.25rem; border-top: 1px solid #eee; background: #fafafa; display: flex; justify-content: flex-end; }

  .modal-section-title { font-size: 0.875rem; font-weight: 700; color: #374151; margin: 1.5rem 0 0.75rem 0; padding-bottom: 0.25rem; border-bottom: 2px solid #f3f4f6; }
  .modal-data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .modal-data-item { display: flex; flex-direction: column; gap: 0.25rem; }
  .data-label { font-size: 0.65rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
  .data-value { font-size: 0.875rem; font-weight: 500; color: #111827; }
  .modal-fechas { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f0f7ff; border: 1px solid #cce3ff; border-radius: 0.5rem; }
`;

const statusConfig: Record<ReservationStatus, { label: string, color: string, bg: string, icon: any }> = {
  pending: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7', icon: Clock },
  approved: { label: 'Aceptada', color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle2 },
  finished: { label: 'Finalizada', color: '#047857', bg: '#d1fae5', icon: CalendarCheck },
  cancelled: { label: 'Cancelada', color: '#be123c', bg: '#ffe4e6', icon: XCircle },
};

const ReservationListContent = () => {
  const { data: reservations, isLoading, isError } = useReservations();
  const { mutate: cancelarReserva, isPending: isCanceling } = useCancelReservation();
  const { mutate: actualizarReserva, isPending: isUpdating } = useUpdateReservation();

  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  const [reservaEditando, setReservaEditando] = useState<FullReservation | null>(null);

  if (isLoading) return <div style={{ padding: '1rem' }}>Cargando...</div>;
  if (isError) return <div style={{ padding: '1rem', color: 'red' }}>Error de conexión.</div>;

  const reservasActivas = reservations?.filter(res => res.status !== 'cancelled') || [];

  return (
    <>
      <style>{estilosGlobales}</style>
      <div style={{ marginTop: '1.5rem' }}>
        {reservasActivas.map((res) => {
          const config = statusConfig[res.status];
          const StatusIcon = config.icon;

          return (
            <div key={res.id} className="reserva-card">
              <div className="reserva-header">
                <div>
                  <h3 className="reserva-titulo">{res.nombre} {res.apellido1}</h3>
                  <div className="reserva-fecha">
                    <CalendarDays size={16} />
                    <span>{format(new Date(res.fechaEntrada), "dd/MM/yyyy")} - {format(new Date(res.fechaSalida), "dd/MM/yyyy")}</span>
                  </div>
                </div>
                <div className="status-badge" style={{ backgroundColor: config.bg, color: config.color }}>
                  <StatusIcon size={18} />
                  <span>{config.label}</span>
                </div>
              </div>

              <div className="reserva-acciones">
                <button className="btn btn-ver" onClick={() => setReservaDetalle(res)}>
                  <Eye size={16} /> Ver Detalles
                </button>

                {res.status === 'pending' && (
                  <button className="btn btn-modificar" onClick={() => setReservaEditando(res)}>
                    <Edit size={16} /> Modificar
                  </button>
                )}

                {res.status === 'approved' && (
                  <button className="btn btn-viajeros"><Users size={16} /> Parte Viajeros</button>
                )}

                {(res.status === 'pending' || res.status === 'approved') && (
                  <button 
                    className="btn btn-cancelar" 
                    disabled={isCanceling}
                    onClick={() => { if(window.confirm('¿Deseas cancelar la reserva?')) cancelarReserva(res.id) }}
                  >
                    <Trash2 size={16} /> {isCanceling ? '...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALLES COMPLETOS (+INFO) */}
      {reservaDetalle && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={20} /> Información de la Reserva</h3>
              <button onClick={() => setReservaDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color="#9ca3af" /></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="modal-grid" style={{ marginBottom: '0.5rem' }}>
                    <div className="modal-card"><p className="data-label">Localizador</p><p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>#{reservaDetalle.id}</p></div>
                    <div className="modal-card"><p className="data-label">Estado</p><p style={{ margin: 0, fontWeight: 700, color: statusConfig[reservaDetalle.status].color }}>{statusConfig[reservaDetalle.status].label}</p></div>
                </div>

                <h4 className="modal-section-title">Datos de la Estancia</h4>
                <div className="modal-fechas" style={{ marginBottom: '1rem' }}>
                    <CalendarDays size={20} color="#3b82f6" />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><p className="data-label">Entrada</p><strong>{format(new Date(reservaDetalle.fechaEntrada), "dd/MM/yyyy")}</strong></div>
                        <div style={{ fontSize: '1.2rem', color: '#bfdbfe' }}>→</div>
                        <div style={{ textAlign: 'right' }}><p className="data-label">Salida</p><strong>{format(new Date(reservaDetalle.fechaSalida), "dd/MM/yyyy")}</strong></div>
                    </div>
                </div>
                
                <div className="modal-data-grid">
                    <div className="modal-data-item"><span className="data-label">Habitación</span><span className="data-value">Número {reservaDetalle.habitacion || 'N/A'}</span></div>
                    <div className="modal-data-item"><span className="data-label">Ocupantes</span><span className="data-value">{reservaDetalle.numPersonas || 1} Persona(s)</span></div>
                </div>

                <h4 className="modal-section-title">Información del Titular</h4>
                <div className="modal-data-grid" style={{ rowGap: '1.2rem' }}>
                    <div className="modal-data-item" style={{ gridColumn: 'span 2' }}>
                        <span className="data-label">Nombre Completo</span>
                        <span className="data-value" style={{ fontSize: '1.1rem' }}>
                          {reservaDetalle.titular?.nombre || reservaDetalle.nombre} {reservaDetalle.titular?.apellido1 || reservaDetalle.apellido1} {reservaDetalle.titular?.apellido2 || ''}
                        </span>
                    </div>

                    <div className="modal-data-item">
                        <span className="data-label">Documento ({reservaDetalle.titular?.tipoDocumento || 'ID'})</span>
                        <span className="data-value">{reservaDetalle.titular?.numeroDocumento || 'N/A'}</span>
                    </div>
                    <div className="modal-data-item">
                        <span className="data-label">Teléfono</span>
                        <span className="data-value">{reservaDetalle.titular?.telefono || 'N/A'}</span>
                    </div>
                    
                    <div className="modal-data-item" style={{ gridColumn: 'span 2' }}>
                        <span className="data-label">Correo Electrónico</span>
                        <span className="data-value">{reservaDetalle.titular?.correo || 'N/A'}</span>
                    </div>

                    <div className="modal-data-item" style={{ gridColumn: 'span 2' }}>
                        <span className="data-label">Dirección y Localización</span>
                        <span className="data-value">
                            {reservaDetalle.titular?.direccion || 'N/A'}, {reservaDetalle.titular?.codigoPostal || ''}
                            {reservaDetalle.titular?.nombreMunicipio ? ` (${reservaDetalle.titular?.nombreMunicipio})` : ''}
                        </span>
                    </div>

                    <div className="modal-data-item">
                        <span className="data-label">País</span>
                        <span className="data-value">{reservaDetalle.titular?.pais || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div className="modal-footer">
                <button className="btn btn-ver" onClick={() => setReservaDetalle(null)} style={{ border: '1px solid #d1d5db' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {reservaEditando && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Edit size={20} /> Editar Reserva #{reservaEditando.id}</h3>
              <button onClick={() => setReservaEditando(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color="#9ca3af" /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <FormularioModificar 
                reservaOriginal={reservaEditando}
                isPending={isUpdating}
                onCancelar={() => setReservaEditando(null)}
                onGuardar={(data) => {
                  actualizarReserva(
                    { id: reservaEditando.id, data },
                    { onSuccess: () => setReservaEditando(null) }
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const DashboardApp = ({ token }: { token: string }) => {
  return (
    <QueryProvider token={token}>
      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontWeight: 700, margin: 0 }}>Gestión de Reservas</h2>
        <ReservationListContent />
      </div>
    </QueryProvider>
  );
}