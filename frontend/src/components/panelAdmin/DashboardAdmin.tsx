import { useState } from 'react';
import { QueryProvider } from '../dashboard/QueryProvider';
import { ArrowLeft } from 'lucide-react';
import type { FullReservation } from '../dashboard/ReservationList';

// Importaciones de los nuevos archivos fragmentados
import AdminSidebar from './AdminSidebar';
import AdminTabReservas from './AdminTabReservas';
import AdminTabFechas from './AdminTabFechas';
import CheckinWalkIn from './CheckinWalkIn';
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

import '../../styles/dashboardAdmin.css';

const AdminContent = () => {
  const [pestaña, setPestaña] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin'>('reservas');
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
               <h3 style={{ marginBottom: '1.5rem' }}>Check-in: {reservaCheckin.titular?.nombre}</h3>
               <ParteViajeros reservaId={reservaCheckin.id} isAdmin={true} />
            </div>
          </div>
        ) : (
          <>
            {pestaña === 'reservas' && <AdminTabReservas onCheckinSelect={setReservaCheckin} />}
            {pestaña === 'vacaciones' && <AdminTabFechas />}
            {pestaña === 'walkin' && <CheckinWalkIn />}
            {pestaña === 'nuevaReserva' && (
              <div className="fade-in">
                <h2 className="admin-text-semibold" style={{ marginBottom: '1.5rem' }}>Reserva Manual</h2>
                <div className="admin-card"><ReservaHotel /></div>
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