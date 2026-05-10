import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { api } from '../dashboard/api'; 
import type { FullReservation } from '../dashboard/ReservationList'; 
import { Calendar, ClipboardList, Ban, ArrowLeft, Check, X } from 'lucide-react';
import { QueryProvider } from '../dashboard/QueryProvider';

// Importamos tus formularios externos
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

const AdminContent = () => {
  const queryClient = useQueryClient();
  
  // ESTADOS DE NAVEGACIÓN
  const [pestañaActiva, setPestañaActiva] = useState<'reservas' | 'nuevaReserva' | 'vacaciones'>('reservas');
  const [reservaParaCheckin, setReservaParaCheckin] = useState<FullReservation | null>(null);
  
  // ESTADOS PARA BLOQUEO DE FECHAS
  const [rangoVacaciones, setRangoVacaciones] = useState<DateRange | undefined>();
  const [diasOcupadosAdmin, setDiasOcupadosAdmin] = useState<Date[]>([]);

  // 1. CARGA DE TODAS LAS RESERVAS
  const { data: reservas, isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
        const res = await api.get('/admin/reservations');
        return res.data;
    },
  });

  // 2. CARGA DE OCUPACIÓN PARA EL CALENDARIO DE VACACIONES
  useEffect(() => {
    if (pestañaActiva === 'vacaciones') {
      const cargarOcupacionGlobal = async () => {
        try {
          const res = await api.get('/ocupacion?habitacion=1'); 
          if (res.data.diasOcupados) {
            const fechas = res.data.diasOcupados.map((f: string) => startOfDay(parseISO(f)));
            setDiasOcupadosAdmin(fechas);
          }
        } catch (error) {
          console.error("Error al cargar ocupación para admin:", error);
        }
      };
      cargarOcupacionGlobal();
    }
  }, [pestañaActiva]);

  // MUTACIONES DE ACCIÓN
  const aprobarReserva = useMutation({
    mutationFn: async (id: string | number) => {
      await api.patch(`/admin/reservations/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Reserva aprobada.");
    }
  });

  const rechazarReserva = useMutation({
    mutationFn: async (id: string | number) => {
      await api.patch(`/admin/reservations/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Acción realizada.");
    }
  });

  const resolverSolicitud = useMutation({
    mutationFn: async ({ id, accion, tipo }: { id: string | number, accion: 'accept' | 'reject', tipo: 'mod' | 'cancel' }) => {
      await api.post(`/admin/reservations/${id}/resolve`, { accion, tipo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Solicitud procesada correctamente.");
    }
  });

  const bloquearFechas = useMutation({
    mutationFn: async () => {
      if (!rangoVacaciones?.from || !rangoVacaciones?.to) return;
      await api.post('/admin/bloqueos', {
        fechaInicio: format(rangoVacaciones.from, 'yyyy-MM-dd'),
        fechaFin: format(rangoVacaciones.to, 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      alert("Fechas bloqueadas correctamente.");
      setRangoVacaciones(undefined);
    }
  });

  const formatearFecha = (fecha: string) => {
    try { return format(new Date(fecha), "dd/MM/yyyy"); } 
    catch { return fecha; }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      
      {/* BARRA LATERAL */}
      <aside style={{ width: '260px', background: '#111827', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#3b82f6', fontWeight: 800 }}>Admin Rural</h2>
        
        <button 
          onClick={() => { setPestañaActiva('reservas'); setReservaParaCheckin(null); }}
          style={{ background: pestañaActiva === 'reservas' ? '#1f2937' : 'transparent', border: 'none', color: 'white', padding: '0.75rem', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <ClipboardList size={20} /> Listado de Reservas
        </button>

        <button 
          onClick={() => { setPestañaActiva('nuevaReserva'); setReservaParaCheckin(null); }}
          style={{ background: pestañaActiva === 'nuevaReserva' ? '#1f2937' : 'transparent', border: 'none', color: 'white', padding: '0.75rem', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Calendar size={20} /> Reserva Manual
        </button>

        <button 
          onClick={() => { setPestañaActiva('vacaciones'); setReservaParaCheckin(null); }}
          style={{ background: pestañaActiva === 'vacaciones' ? '#1f2937' : 'transparent', border: 'none', color: 'white', padding: '0.75rem', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Ban size={20} /> Bloquear Fechas
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '2rem' }}>
        
        {/* MODO CHECK-IN ACTIVO */}
        {reservaParaCheckin && (
          <div>
            <button onClick={() => setReservaParaCheckin(null)} style={{ background: 'none', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
               <h3 style={{ marginBottom: '1rem' }}>Check-in: {reservaParaCheckin.titular?.nombre || reservaParaCheckin.nombre}</h3>
               <ParteViajeros reservaId={reservaParaCheckin.id} />
            </div>
          </div>
        )}

        {/* LISTADO DE RESERVAS */}
        {pestañaActiva === 'reservas' && !reservaParaCheckin && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Gestión de Reservas</h2>
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr style={{ textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Titular</th>
                    <th style={{ padding: '1rem' }}>Fechas</th>
                    <th style={{ padding: '1rem' }}>Estado / Solicitudes</th>
                    <th style={{ padding: '1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {reservas?.map((res: FullReservation) => (
                    <tr key={res.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>#{res.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{res.titular?.nombre || res.nombre} {res.titular?.apellido1 || res.apellido1}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Hab: {res.habitacion || '1'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {formatearFecha(res.fechaEntrada)} - {formatearFecha(res.fechaSalida)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {res.status === 'pending' && <span style={{ color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', alignSelf: 'start' }}>Pendiente</span>}
                          {res.status === 'approved' && <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', alignSelf: 'start' }}>Confirmada</span>}
                          {res.status === 'finished' && <span style={{ color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', alignSelf: 'start' }}>Finalizada</span>}
                          
                          {/* Alertas de solicitud */}
                          {res.solicitud_cancelacion === 1 && (
                            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', marginTop: '4px' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚠️ Pide Anular</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'cancel' })} style={{ background: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>Aceptar</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'cancel' })} style={{ background: 'white', border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>No</button>
                              </div>
                            </div>
                          )}
                          {res.datos_modificacion && (
                            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', marginTop: '4px' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📅 Pide Cambio</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'accept', tipo: 'mod' })} style={{ background: '#0369a1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>Aceptar</button>
                                <button onClick={() => resolverSolicitud.mutate({ id: res.id, accion: 'reject', tipo: 'mod' })} style={{ background: 'white', border: '1px solid #0369a1', color: '#0369a1', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>No</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {res.status === 'pending' && (
                          <button onClick={() => aprobarReserva.mutate(res.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Aprobar</button>
                        )}
                        {res.status === 'approved' && (
                          <button onClick={() => setReservaParaCheckin(res)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Hacer Check-in</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: BLOQUEO DE FECHAS (VACACIONES) */}
        {pestañaActiva === 'vacaciones' && !reservaParaCheckin && (
          <div>
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ban color="#ef4444" /> Bloqueo de Vacaciones
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Las fechas en rojo ya tienen reservas de clientes.</p>
            
            <div style={{ display: 'inline-block', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <DayPicker
                  mode="range"
                  selected={rangoVacaciones}
                  onSelect={setRangoVacaciones}
                  locale={es}
                  disabled={[
                    { before: new Date() },
                    ...diasOcupadosAdmin // Bloqueamos los días reservados
                  ]}
                  modifiers={{ ocupado: diasOcupadosAdmin }}
                  modifiersStyles={{
                    ocupado: { 
                      color: '#ef4444', 
                      backgroundColor: '#fee2e2',
                      fontWeight: 'bold',
                      textDecoration: 'line-through'
                    }
                  }}
                />
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={() => bloquearFechas.mutate()}
                disabled={!rangoVacaciones?.from || !rangoVacaciones?.to}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, opacity: (!rangoVacaciones?.from || !rangoVacaciones?.to) ? 0.5 : 1 }}
              >
                Confirmar Bloqueo Manual
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: RESERVA MANUAL */}
        {pestañaActiva === 'nuevaReserva' && !reservaParaCheckin && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Crear Reserva Interna</h2>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
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