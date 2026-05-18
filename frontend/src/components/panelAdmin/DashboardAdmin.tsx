import { useState } from 'react';
import { QueryProvider } from '../dashboard/QueryProvider';
import { ArrowLeft } from 'lucide-react';
import type { FullReservation } from '../dashboard/ReservationList';

// Importaciones de los componentes fragmentados y optimizados
import AdminSidebar from './AdminSidebar';
import AdminTabReservas from './AdminTabReservas';
import AdminTabFechas from './AdminTabFechas';
import CheckinWalkIn from './CheckinWalkIn';
import AdminTabLogs from './AdminTabLogs';
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

import '../../styles/dashboardAdmin.css';

const AdminContent = () => {
  // Estado de navegación que controla la pestaña activa (incluyendo 'logs')
  const [pestaña, setPestaña] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin' | 'logs'>('reservas');
  
  // Estado para gestionar si se está realizando el Check-in de una reserva existente
  const [reservaCheckin, setReservaCheckin] = useState<FullReservation | null>(null);

  return (
    <div className="admin-layout">
      {/* Menú Lateral de Navegación */}
      <AdminSidebar pestañaActiva={pestaña} setTab={setPestaña} />

      {/* Contenedor Principal de Vistas */}
      <main className="admin-main">
        
        {/* MODO CHECK-IN (Se superpone visualmente si hay una reserva seleccionada) */}
        {reservaCheckin ? (
          <div className="fade-in">
            <button onClick={() => setReservaCheckin(null)} className="admin-back-btn">
              <ArrowLeft size={16} /> Volver al listado
            </button>
            <div className="admin-card">
               <div className="admin-page-title">
                 <h3>Check-in: {reservaCheckin.titular?.nombre || reservaCheckin.nombre}</h3>
               </div>
               <ParteViajeros reservaId={reservaCheckin.id} isAdmin={true} />
            </div>
          </div>
        ) : (
          /* RENDERIZADO CONDICIONAL DE LAS PESTAÑAS */
          <>
            {pestaña === 'reservas' && (
              <AdminTabReservas onCheckinSelect={setReservaCheckin} />
            )}
            
            {pestaña === 'vacaciones' && (
              <AdminTabFechas />
            )}
            
            {pestaña === 'walkin' && (
              <CheckinWalkIn />
            )}

            {pestaña === 'logs' && (
              <AdminTabLogs />
            )}
            
            {pestaña === 'nuevaReserva' && (
              <div className="fade-in">
                <div className="admin-page-title">
                  <h2>Reserva Manual</h2>
                </div>
                <div className="admin-card">
                  <ReservaHotel />
                </div>
              </div>
            )}
          </>
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