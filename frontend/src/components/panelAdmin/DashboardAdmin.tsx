import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import '../../styles/dashboardAdmin.css'; 
import { api } from '../dashboard/api'; 
import type { FullReservation } from '../dashboard/ReservationList'; 
import { 
  Calendar, ClipboardList, Ban, Users, ArrowLeft, 
  Loader2, Euro, Eye, Trash2, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { QueryProvider } from '../dashboard/QueryProvider';

// Importación de componentes hijos
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';
import CheckinWalkIn from './CheckinWalkIn';

const AdminContent = () => {
  const queryClient = useQueryClient();
  
  // ESTADOS DE NAVEGACIÓN Y MODALES
  const [pestañaActiva, setPestañaActiva] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin'>('reservas');
  const [reservaParaCheckin, setReservaParaCheckin] = useState<FullReservation | null>(null);
  const [reservaDetalle, setReservaDetalle] = useState<FullReservation | null>(null);
  
  // ESTADOS PARA BLOQUEO DE FECHAS (VACACIONES)
  const [rangoVacaciones, setRangoVacaciones] = useState<DateRange | undefined>();
  const [habitacionBloqueo, setHabitacionBloqueo] = useState<string>("1");

  // --- QUERIES ---
  const { data: reservas } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
        const res = await api.get('/admin/reservations');
        return res.data;
    },
  });

  const { data: ocupacion, isLoading: cargandoOcupacion } = useQuery({
    queryKey: ['admin-occupancy', habitacionBloqueo],
    queryFn: async () => {
      const res = await api.get(`/ocupacion?habitacion=${habitacionBloqueo}`);
      if (res.data.diasOcupados) {
        return res.data.diasOcupados.map((f: string) => startOfDay(parseISO(f)));
      }
      return [];
    },
    enabled: pestañaActiva === 'vacaciones', 
  });

  // --- MUTACIONES ---

  // Aprobar reserva normal
  const aprobarReserva = useMutation({
    mutationFn: async (id: string | number) => await api.patch(`/admin/reservations/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
  });

  // Confirmar pago y aprobar de golpe
  const confirmarIngresoYAprobar = useMutation({
    mutationFn: async (id: string | number) => await api.post(`/admin/reservations/${id}/confirmar-pago`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Pago verificado y reserva aprobada.");
    }
  });

  // Resolver solicitudes del cliente (cambios o cancelaciones)
  const resolverSolicitud = useMutation({
    mutationFn: async ({ id, accion, tipo }: { id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel' }) => {
      await api.post(`/admin/reservations/${id}/resolve`, { accion, tipo });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
  });

  // Cancelación directa por el Admin
  const cancelarReservaAdmin = useMutation({
    mutationFn: async (id: string | number) => await api.delete(`/admin/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Reserva anulada correctamente.");
    }
  });

  // Bloqueo de calendario
  const bloquearFechas = useMutation({
    mutationFn: async () => {
      if (!rangoVacaciones?.from || !rangoVacaciones?.to) return;
      await api.post('/admin/bloqueos', {
        habitacion_id: habitacionBloqueo,
        fechaInicio: format(rangoVacaciones.from, 'yyyy-MM-dd'),
        fechaFin: format(rangoVacaciones.to, 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy', habitacionBloqueo] });
      setRangoVacaciones(undefined);
      alert("Fechas bloqueadas correctamente.");
    }
  });

  const formatearFecha = (fecha: string) => {
    try { return format(new Date(fecha), "dd/MM/yyyy"); } 
    catch { return fecha; }
  };

  return (
    <div className="admin-layout">
      
      {/* BARRA LATERAL */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Rural</h2>
        
        <button onClick={() => { setPestañaActiva('reservas'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'reservas' ? 'active' : ''}`}>
          <ClipboardList size={20} /> Listado de Reservas
        </button>

        <button onClick={() => { setPestañaActiva('walkin'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'walkin' ? 'active' : ''}`}>
          <Users size={20} /> Check-in Directo
        </button>

        <button onClick={() => { setPestañaActiva('nuevaReserva'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'nuevaReserva' ? 'active' : ''}`}>
          <Calendar size={20} /> Reserva Manual
        </button>

        <button onClick={() => { setPestañaActiva('vacaciones'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'vacaciones' ? 'active' : ''}`}>
          <Ban size={20} /> Bloquear Fechas
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="admin-main">
        
        {/* MODO CHECK-IN */}
        {reservaParaCheckin && (
          <div className="fade-in">
            <button onClick={() => setReservaParaCheckin(null)} className="admin-back-btn">
              <ArrowLeft size={16} /> Volver al listado
            </button>
            <div className="admin-card">
               <h3 style={{ marginBottom: '1.5rem' }}>Realizar Check-in: {reservaParaCheckin.titular?.nombre || reservaParaCheckin.nombre}</h3>
               <ParteViajeros reservaId={reservaParaCheckin.id} isAdmin={true} />
            </div>
          </div>
        )}

        {/* PESTAÑA: LISTADO DE RESERVAS */}
        {pestañaActiva === 'reservas' && !reservaParaCheckin && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Gestión de Reservas</h2>
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
                        <div style={{ fontWeight: 600 }}>{res.titular?.nombre || res.nombre} {res.titular?.apellido1 || res.apellido1}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: #{res.id} | Hab: {res.habitacion || '1'}</div>
                      </td>
                      <td>{formatearFecha(res.fechaEntrada)} - {formatearFecha(res.fechaSalida)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge badge-${res.status}`}>{res.status}</span>
                          
                          {/* Alert Pago Pendiente */}
                          {res.status === 'pending' && (res.estado_pago === 'pendiente' || !res.estado_pago) && (
                             <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>⏳ Esperando fondos</span>
                          )}

                          {/* Solicitud de Devolución/Anulación */}
                          {res.estado_pago === 'devolucion_solicitada' && (
                            <div className="alert-box alert-cancel" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                              <div className="alert-title">🚨 ANULACIÓN + DEVOLUCIÓN</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} className="btn-small accept-cancel">Aceptar y Marcar Devuelto</button>
                              </div>
                            </div>
                          )}

                          {/* Solicitud de Cancelación (Sin haber pagado aún) */}
                          {res.solicitud_cancelacion === 1 && res.estado_pago !== 'devolucion_solicitada' && (
                            <div className="alert-box alert-cancel">
                              <div className="alert-title">⚠️ El cliente quiere anular</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} className="btn-small accept-cancel">Confirmar Anulación</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'cancel' })} className="btn-small reject-cancel">Rechazar</button>
                              </div>
                            </div>
                          )}

                          {/* Solicitud de Modificación */}
                          {res.datos_modificacion && (
                            <div className="alert-box alert-mod">
                              <div className="alert-title">📅 Piden cambio de fechas</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'mod' })} className="btn-small accept-mod">Aceptar</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'mod' })} className="btn-small reject-mod">No</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                          
                          <button onClick={() => setReservaDetalle(res)} className="btn-action" style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Eye size={14} /> + Info
                          </button>

                          {res.status === 'pending' && (res.estado_pago === 'pendiente' || !res.estado_pago) && (
                             <button 
                               onClick={() => { if(confirm('¿Deseas forzar la aprobación aunque no haya notificado pago?')) confirmarIngresoYAprobar.mutate(res.id) }} 
                               className="btn-action" style={{ background: '#f59e0b', color: 'white' }}>
                               Forzar Aprobación
                             </button>
                          )}

                          {res.status === 'pending' && res.estado_pago === 'notificado' && (
                             <button 
                               onClick={() => { if(confirm('¿Verificaste el ingreso bancario? Se aprobará la reserva.')) confirmarIngresoYAprobar.mutate(res.id) }} 
                               className="btn-action btn-approve" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                               <Euro size={16} /> Confirmar Ingreso
                             </button>
                          )}

                          {res.status === 'approved' && (
                             <button onClick={() => setReservaParaCheckin(res)} className="btn-action btn-checkin">Hacer Check-in</button>
                          )}

                          {(res.status === 'pending' || res.status === 'approved') && (
                             <button 
                               onClick={() => { if(confirm('¿Seguro que quieres anular esta reserva definitivamente?')) cancelarReservaAdmin.mutate(res.id) }} 
                               className="btn-action" style={{ background: '#fff1f2', color: '#be123c', border: 'none', fontWeight: 600 }}>
                               <Trash2 size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> Anular Reserva
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL DE + INFO (DETALLES) */}
        {reservaDetalle && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="admin-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <button onClick={() => setReservaDetalle(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#9ca3af" />
              </button>
              
              <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                Detalles Reserva #{reservaDetalle.id}
              </h2>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <section>
                  <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Huésped Titular</h4>
                  <p style={{ margin: '4px 0' }}><strong>Nombre:</strong> {reservaDetalle.titular?.nombre || reservaDetalle.nombre} {reservaDetalle.titular?.apellido1 || reservaDetalle.apellido1}</p>
                  <p style={{ margin: '4px 0' }}><strong>DNI/Pasaporte:</strong> {reservaDetalle.titular?.numeroDocumento || 'No aportado'}</p>
                  <p style={{ margin: '4px 0' }}><strong>Teléfono:</strong> {reservaDetalle.titular?.telefono || '-'}</p>
                  <p style={{ margin: '4px 0' }}><strong>Email:</strong> {reservaDetalle.titular?.correo || '-'}</p>
                </section>

                <section style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#111827', marginBottom: '0.5rem' }}>Estancia</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <p style={{ margin: 0 }}><strong>Habitación:</strong> {reservaDetalle.habitacion || '1'}</p>
                    <p style={{ margin: 0 }}><strong>Personas:</strong> {reservaDetalle.numPersonas || '-'}</p>
                    <p style={{ margin: 0 }}><strong>Entrada:</strong> {formatearFecha(reservaDetalle.fechaEntrada)}</p>
                    <p style={{ margin: 0 }}><strong>Salida:</strong> {formatearFecha(reservaDetalle.fechaSalida)}</p>
                  </div>
                </section>

                <section>
                  <h4 style={{ color: '#111827', marginBottom: '0.5rem' }}>Estado del Pago</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Euro size={18} color="#059669" />
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{reservaDetalle.estado_pago || 'pendiente'}</span>
                  </div>
                </section>
              </div>

              <button onClick={() => setReservaDetalle(null)} className="admin-nav-btn" style={{ background: '#111827', width: '100%', justifyContent: 'center', marginTop: '2rem' }}>
                Cerrar Detalles
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: WALK-IN (CHECK-IN DIRECTO) */}
        {pestañaActiva === 'walkin' && (
          <CheckinWalkIn />
        )}

        {/* PESTAÑA: VACACIONES (BLOQUEO) */}
        {pestañaActiva === 'vacaciones' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ban color="#ef4444" /> Bloqueo de Fechas
            </h2>
            <div className="bloqueo-grid">
              <div className="admin-card">
                <div className="form-group">
                  <label className="form-label">Habitación:</label>
                  <select value={habitacionBloqueo} onChange={(e) => setHabitacionBloqueo(e.target.value)} className="form-select">
                    <option value="1">Habitación 1 (Norte)</option>
                    <option value="2">Habitación 2 (Sur)</option>
                  </select>
                </div>
                <div className="calendar-wrapper">
                  {cargandoOcupacion && <div className="loader-overlay"><Loader2 className="animate-spin" /></div>}
                  <DayPicker mode="range" selected={rangoVacaciones} onSelect={setRangoVacaciones} locale={es}
                    disabled={[{ before: new Date() }, ...(ocupacion || [])]}
                    modifiers={{ ocupado: ocupacion || [] }}
                    modifiersClassNames={{ ocupado: 'day-picker-occupied' }} />
                </div>
              </div>
              <div className="summary-card">
                <h4 style={{ marginBottom: '1rem' }}>Resumen</h4>
                <p className="summary-text">Habitación: {habitacionBloqueo}</p>
                <p className="summary-text">Desde: {rangoVacaciones?.from ? format(rangoVacaciones.from, 'dd/MM/yyyy') : '-'}</p>
                <p className="summary-text">Hasta: {rangoVacaciones?.to ? format(rangoVacaciones.to, 'dd/MM/yyyy') : '-'}</p>
                <button onClick={() => bloquearFechas.mutate()} disabled={!rangoVacaciones?.from || !rangoVacaciones?.to} className="btn-action btn-danger">Confirmar Bloqueo</button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: RESERVA MANUAL */}
        {pestañaActiva === 'nuevaReserva' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Nueva Reserva Manual</h2>
            <div className="admin-card">
              <ReservaHotel />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export const DashboardAdmin = ({ token }: { token: string }) => (
  <QueryProvider token={token}>
    <AdminContent />
  </QueryProvider>
);