import { useState } from 'react';
import { QueryProvider } from '../dashboard/QueryProvider';
import { ArrowLeft } from 'lucide-react';
import type { FullReservation } from '../dashboard/ReservationList';

// Importaciones actualizadas
import AdminSidebar from './AdminSidebar';
import AdminTabReservas from './AdminTabReservas';
import AdminTabFechas from './AdminTabFechas';
import CheckinWalkIn from './CheckinWalkIn';
import AdminTabSES from './AdminTabSES'; // <-- Componente correcto importado
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

import '../../styles/dashboardAdmin.css';

const AdminContent = () => {
  // Ajustamos el tipo del estado para usar 'ses' en lugar de 'logs'
  const [pestaña, setPestaña] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin' | 'ses'>('reservas');
  const [reservaCheckin, setReservaCheckin] = useState<FullReservation | null>(null);

  return (
    <div className="admin-layout">
      <AdminSidebar pestañaActiva={pestaña} setTab={setPestaña} />

      <main className="admin-main">
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

            {pestaña === 'ses' && (
              <AdminTabSES /> // <-- Renderizado correcto
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