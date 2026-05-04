import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { api } from '../dashboard/api'; 
import type { FullReservation } from '../dashboard/ReservationList'; 
import { Calendar, ClipboardList, Ban, ArrowLeft } from 'lucide-react';
import { QueryProvider } from '../dashboard/QueryProvider';

import '../../styles/dashboardAdmin.css';

import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

const fetchAllReservations = async (): Promise<FullReservation[]> => {
  const response = await api.get('/admin/reservations'); 
  return response.data;
};

const AdminContent = () => {
  const queryClient = useQueryClient();
  
  // 1. Quitamos 'checkin' de aquí
  const [pestañaActiva, setPestañaActiva] = useState<'reservas' | 'nuevaReserva' | 'vacaciones'>('reservas');
  
  // 2. Nuevo estado: Guarda la reserva a la que le estamos haciendo el check-in
  const [reservaParaCheckin, setReservaParaCheckin] = useState<FullReservation | null>(null);
  
  const [rangoVacaciones, setRangoVacaciones] = useState<DateRange | undefined>();

  const { data: reservas, isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: fetchAllReservations,
  });

  const aprobarReserva = useMutation({
    mutationFn: async (id: string | number) => {
      await api.patch(`/admin/reservations/${id}/approve`);
      await api.post(`/admin/reservations/${id}/contrato`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Reserva aprobada y contrato generado.");
    }
  });

  const rechazarReserva = useMutation({
    mutationFn: async (id: string | number) => {
      await api.patch(`/admin/reservations/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      alert("Reserva anulada.");
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
    <div className="admin-layout">
      {/* BARRA LATERAL */}
      <div className="admin-sidebar">
        <button 
          className={`admin-nav-btn ${pestañaActiva === 'reservas' ? 'active' : ''}`}
          onClick={() => { setPestañaActiva('reservas'); setReservaParaCheckin(null); }}
        >
          <ClipboardList size={20} /> Listado de Reservas
        </button>

        <button 
          className={`admin-nav-btn ${pestañaActiva === 'nuevaReserva' ? 'active' : ''}`}
          onClick={() => { setPestañaActiva('nuevaReserva'); setReservaParaCheckin(null); }}
        >
          <Calendar size={20} /> Crear Reserva Manual
        </button>

        <button 
          className={`admin-nav-btn ${pestañaActiva === 'vacaciones' ? 'active' : ''}`}
          onClick={() => { setPestañaActiva('vacaciones'); setReservaParaCheckin(null); }}
        >
          <Ban size={20} /> Bloquear Fechas
        </button>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="admin-main">
        
        {/* --- VISTA: MODO CHECK-IN ACTIVO --- */}
        {reservaParaCheckin && (
          <div>
            <button 
              onClick={() => setReservaParaCheckin(null)}
              className="btn-outline btn-grey"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
              <ArrowLeft size={16} /> Volver a las reservas
            </button>
            
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>
                Check-in para Reserva #{reservaParaCheckin.id}
              </h3>
              <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>
                Titular: {reservaParaCheckin.nombre} {reservaParaCheckin.apellido1} | Habitación: {reservaParaCheckin.habitacion || '-'}
              </p>
            </div>

            <ParteViajeros />
          </div>
        )}

        {/* --- VISTA NORMAL: TABLA DE RESERVAS --- */}
        {pestañaActiva === 'reservas' && !reservaParaCheckin && (
          <div>
            <h2 className="admin-title">Panel de Control de Reservas</h2>
            {isLoading ? <p>Cargando datos del servidor...</p> : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Estado</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Titular</th>
                      <th>Hab.</th>
                      <th>Check-in</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas?.map((res) => (
                      <tr key={res.id}>
                        <td>{res.id}</td>
                        <td>
                          {res.status === 'approved' && <span className="badge badge-success">Confirmada</span>}
                          {res.status === 'pending' && <span className="badge badge-warning">Pendiente</span>}
                          {res.status === 'cancelled' && <span className="badge badge-danger">Cancelada</span>}
                        </td>
                        <td>{formatearFecha(res.fechaEntrada)}</td>
                        <td>{formatearFecha(res.fechaSalida)}</td>
                        <td>{res.nombre} {res.apellido1}</td>
                        <td>{res.habitacion || '-'}</td>
                        
                        {/* BOTÓN DE CHECK-IN DENTRO DE LA TABLA */}
                        <td>
                          {res.status === 'approved' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <span className="badge badge-warning">Pendiente</span>
                              <button 
                                className="btn-outline btn-green" 
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                onClick={() => setReservaParaCheckin(res)}
                              >
                                Registrar en SES
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sin check-in</span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            {res.status === 'pending' ? (
                              <>
                                <button className="btn-outline btn-blue" onClick={() => aprobarReserva.mutate(res.id)}>Aprobar</button>
                                <button className="btn-outline btn-red" onClick={() => rechazarReserva.mutate(res.id)}>Rechazar</button>
                              </>
                            ) : res.status === 'approved' ? (
                              <>
                                <button className="btn-outline btn-blue">Editar contrato</button>
                                <button className="btn-outline btn-grey" disabled>Confirmada</button>
                                <button className="btn-outline btn-red" onClick={() => rechazarReserva.mutate(res.id)}>Anular</button>
                              </>
                            ) : (
                              <span className="badge badge-neutral">Archivada</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: CREAR RESERVA */}
        {pestañaActiva === 'nuevaReserva' && !reservaParaCheckin && (
          <div>
            <h2 className="admin-title">Crear Reserva Interna</h2>
            <ReservaHotel />
          </div>
        )}

        {/* PESTAÑA: VACACIONES */}
        {pestañaActiva === 'vacaciones' && !reservaParaCheckin && (
          <div>
            {/* (Aquí va el código de las vacaciones del paso anterior) */}
            <h2 className="admin-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ban size={24} color="#ef4444" /> Bloqueo Manual de Fechas
            </h2>
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'inline-block' }}>
                <DayPicker
                  mode="range"
                  selected={rangoVacaciones}
                  onSelect={setRangoVacaciones}
                  locale={es}
                  disabled={[{ before: new Date() }]} 
                />
              </div>
              <button 
                  onClick={() => bloquearFechas.mutate()}
                  disabled={!rangoVacaciones?.from || !rangoVacaciones?.to}
                  style={{ marginTop: '1.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                >
                  Confirmar Bloqueo
              </button>
          </div>
        )}

      </div>
    </div>
  );
};

export const DashboardAdmin = ({ token }: { token: string }) => {
  return (
    <QueryProvider token={token}>
      <AdminContent />
    </QueryProvider>
  );
};