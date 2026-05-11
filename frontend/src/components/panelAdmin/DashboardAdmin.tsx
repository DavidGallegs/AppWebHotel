import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import '../../styles/dashboardAdmin.css'; 
import { api } from '../dashboard/api'; 
import type { FullReservation } from '../dashboard/ReservationList'; 
import { Calendar, ClipboardList, Ban, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { QueryProvider } from '../dashboard/QueryProvider';

// Importación de componentes hijos
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';
import CheckinWalkIn from './CheckinWalkIn';

const AdminContent = () => {
  const queryClient = useQueryClient();
  
  // ESTADOS DE NAVEGACIÓN
  const [pestañaActiva, setPestañaActiva] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin'>('reservas');
  const [reservaParaCheckin, setReservaParaCheckin] = useState<FullReservation | null>(null);
  
  // ESTADOS PARA BLOQUEO DE FECHAS (VACACIONES)
  const [rangoVacaciones, setRangoVacaciones] = useState<DateRange | undefined>();
  const [habitacionBloqueo, setHabitacionBloqueo] = useState<string>("1");

  // --- QUERIES ---

  // 1. Obtener todas las reservas
  const { data: reservas } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
        const res = await api.get('/admin/reservations');
        return res.data;
    },
  });

  // 2. Obtener ocupación reactiva para el calendario de bloqueos
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

  const aprobarReserva = useMutation({
    mutationFn: async (id: string | number) => await api.patch(`/admin/reservations/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
  });

  const resolverSolicitud = useMutation({
    mutationFn: async ({ id, accion, tipo }: { id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel' }) => {
      await api.post(`/admin/reservations/${id}/resolve`, { accion, tipo });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
  });

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
      // Refresco inmediato del calendario de bloqueos
      queryClient.invalidateQueries({ queryKey: ['admin-occupancy', habitacionBloqueo] });
      setRangoVacaciones(undefined);
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
        
        <button 
          onClick={() => { setPestañaActiva('reservas'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'reservas' ? 'active' : ''}`}
        >
          <ClipboardList size={20} /> Listado de Reservas
        </button>

        <button 
          onClick={() => { setPestañaActiva('walkin'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'walkin' ? 'active' : ''}`}
        >
          <Users size={20} /> Check-in Directo
        </button>

        <button 
          onClick={() => { setPestañaActiva('nuevaReserva'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'nuevaReserva' ? 'active' : ''}`}
        >
          <Calendar size={20} /> Reserva Manual
        </button>

        <button 
          onClick={() => { setPestañaActiva('vacaciones'); setReservaParaCheckin(null); }}
          className={`admin-nav-btn ${pestañaActiva === 'vacaciones' ? 'active' : ''}`}
        >
          <Ban size={20} /> Bloquear Fechas
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="admin-main">
        
        {/* MODO CHECK-IN (Desde la tabla de reservas) */}
        {reservaParaCheckin && (
          <div className="fade-in">
            <button onClick={() => setReservaParaCheckin(null)} className="admin-back-btn">
              <ArrowLeft size={16} /> Volver al listado
            </button>
            <div className="admin-card">
               <h3 style={{ marginBottom: '1.5rem' }}>Check-in: {reservaParaCheckin.nombre}</h3>
               <ParteViajeros reservaId={reservaParaCheckin.id} />
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
                    <th>Estado / Solicitudes</th>
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
                          
                          {res.solicitud_cancelacion === 1 && (
                            <div className="alert-box alert-cancel">
                              <div className="alert-title">⚠️ Pide Anulación</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} className="btn-small accept-cancel">Aceptar</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'cancel' })} className="btn-small reject-cancel">No</button>
                              </div>
                            </div>
                          )}

                          {res.datos_modificacion && (
                            <div className="alert-box alert-mod">
                              <div className="alert-title">📅 Pide Cambio de Fecha</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'mod' })} className="btn-small accept-mod">Aceptar</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'mod' })} className="btn-small reject-mod">No</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {res.status === 'pending' && (
                             <button onClick={() => aprobarReserva.mutate(res.id)} className="btn-action btn-approve">Aprobar</button>
                          )}
                          {res.status === 'approved' && (
                             <button onClick={() => setReservaParaCheckin(res)} className="btn-action btn-checkin">Hacer Check-in</button>
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

        {/* PESTAÑA: CHECK-IN DIRECTO (WALK-IN) */}
        {pestañaActiva === 'walkin' && (
          <CheckinWalkIn />
        )}

        {/* PESTAÑA: BLOQUEO DE VACACIONES */}
        {pestañaActiva === 'vacaciones' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ban color="#ef4444" /> Bloqueo de Fechas por Habitación
            </h2>

            <div className="bloqueo-grid">
              <div className="admin-card">
                <div className="form-group">
                  <label className="form-label">1. Selecciona Habitación:</label>
                  <select 
                    value={habitacionBloqueo} 
                    onChange={(e) => setHabitacionBloqueo(e.target.value)}
                    className="form-select"
                  >
                    <option value="1">Habitación 1 (Norte)</option>
                    <option value="2">Habitación 2 (Sur)</option>
                  </select>
                </div>

                <label className="form-label">2. Selecciona rango de fechas a cerrar:</label>
                <div className="calendar-wrapper">
                  {cargandoOcupacion && (
                    <div className="loader-overlay">
                      <Loader2 className="animate-spin" />
                    </div>
                  )}
                  <DayPicker
                    mode="range"
                    selected={rangoVacaciones}
                    onSelect={setRangoVacaciones}
                    locale={es}
                    disabled={[{ before: new Date() }, ...(ocupacion || [])]}
                    modifiers={{ ocupado: ocupacion || [] }}
                    modifiersClassNames={{
                      ocupado: 'day-picker-occupied'
                    }}
                  />
                </div>
              </div>

              <div className="summary-card">
                <h4 style={{ margin: '0 0 1rem 0' }}>Resumen del Bloqueo</h4>
                <p className="summary-text">Habitación: <span style={{ color: 'white' }}>{habitacionBloqueo}</span></p>
                <p className="summary-text">Inicio: <span style={{ color: 'white' }}>{rangoVacaciones?.from ? format(rangoVacaciones.from, 'dd/MM/yyyy') : '-'}</span></p>
                <p className="summary-text">Fin: <span style={{ color: 'white' }}>{rangoVacaciones?.to ? format(rangoVacaciones.to, 'dd/MM/yyyy') : '-'}</span></p>
                
                <button 
                  onClick={() => bloquearFechas.mutate()}
                  disabled={!rangoVacaciones?.from || !rangoVacaciones?.to || bloquearFechas.isPending}
                  className="btn-action btn-danger"
                >
                  {bloquearFechas.isPending ? 'Bloqueando...' : 'Confirmar Bloqueo Manual'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: RESERVA MANUAL */}
        {pestañaActiva === 'nuevaReserva' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Crear Reserva Manual</h2>
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