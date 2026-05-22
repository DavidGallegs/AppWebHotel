import { useState } from 'react';
import { QueryProvider } from '../dashboard/QueryProvider';
import { ArrowLeft } from 'lucide-react';
import type { FullReservation } from '../dashboard/ReservationList';

import AdminSidebar from './AdminSidebar';
import AdminTabReservas from './AdminTabReservas';
import AdminTabFechas from './AdminTabFechas';
import CheckinWalkIn from './CheckinWalkIn';
import AdminTabSES from './AdminTabSES'; 
import ReservaHotel from '../formularios/reservaHotel/ReservaHotel';
import ParteViajeros from '../formularios/parteViajeros/ParteViajeros';

import '../../styles/dashboardAdmin.css';

/* * COMPONENTE: AdminContent
 * Propósito: Es el "molde" principal. Dependiendo del estado 'pestaña', 
 * renderiza un componente u otro. Actúa como un enrutador interno.
 */
const AdminContent = () => {
  const [pestaña, setPestaña] = useState<'reservas' | 'nuevaReserva' | 'vacaciones' | 'walkin' | 'ses'>('reservas');
  
  // Si este estado tiene datos, la pantalla cambia completamente para mostrar el formulario de Check-in
  const [reservaCheckin, setReservaCheckin] = useState<FullReservation | null>(null);

  return (
    <div className="admin-layout">
      <AdminSidebar pestañaActiva={pestaña} setTab={setPestaña} />

      <main className="admin-main">
        {/* Lógica de vistas: ¿Estamos haciendo check-in a una reserva existente? */}
        {reservaCheckin ? (
          <div className="fade-in">
            <button 
                onClick={() => setReservaCheckin(null)} 
                className="admin-back-btn"
                aria-label="Cancelar check-in y volver al listado"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Volver al listado
            </button>
            <div className="admin-card">
               <div className="admin-page-title">
                 <h3>Check-in: {reservaCheckin.titular?.nombre || reservaCheckin.nombre}</h3>
               </div>
               {/* Reutilizamos el formulario de viajeros, pasándole la flag isAdmin */}
               <ParteViajeros reservaId={reservaCheckin.id} isAdmin={true} />
            </div>
          </div>
        ) : (
          // Si no estamos haciendo check-in, mostramos la pestaña seleccionada en el menú
          <>
            {pestaña === 'reservas' && <AdminTabReservas onCheckinSelect={setReservaCheckin} />}
            {pestaña === 'vacaciones' && <AdminTabFechas />}
            {pestaña === 'walkin' && <CheckinWalkIn />}
            {pestaña === 'ses' && <AdminTabSES />}
            
            {pestaña === 'nuevaReserva' && (
              <div className="fade-in">
                <div className="admin-page-title">
                  <h2>Reserva Manual</h2>
                </div>
                <div className="admin-card">
                  {/* Reutilizamos el formulario que hicimos para los clientes */}
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