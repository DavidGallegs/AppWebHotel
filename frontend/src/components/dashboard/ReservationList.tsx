import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useReservations } from './useReservations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle2, XCircle, CalendarCheck, CalendarDays } from 'lucide-react';
import type { ReservationStatus } from './reservation';
import { setAuthToken } from './api';

const statusConfig: Record<ReservationStatus, { label: string, color: string, bg: string, icon: any }> = {
  pending: { label: 'Pendiente de aceptar', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  approved: { label: 'Aceptada (Espera)', color: 'text-blue-700', bg: 'bg-blue-100', icon: CheckCircle2 },
  finished: { label: 'Finalizada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CalendarCheck },
  cancelled: { label: 'Cancelada/Rechazada', color: 'text-rose-700', bg: 'bg-rose-100', icon: XCircle },
};

// Esta es la parte visual de las tarjetas
const ReservationListContent = () => {
  const { data: reservations, isLoading, isError } = useReservations();

  if (isLoading) return <div className="p-4 text-gray-600">Cargando tus reservas...</div>;
  if (isError) return <div className="p-4 text-red-500">Error conectando con Laravel.</div>;
  if (!reservations || reservations.length === 0) return <div className="p-4">No tienes reservas.</div>;

  return (
    <div className="grid gap-4 mt-6">
      {reservations.map((res) => {
        const config = statusConfig[res.status];
        const Icon = config.icon;

        return (
          <div key={res.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{res.nombre} {res.apellido1}</h3>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <CalendarDays size={16} />
                <span className="capitalize">{format(new Date(res.fechaEntrada), "d MMM yyyy", { locale: es })}</span>
                {' - '}
                <span className="capitalize">{format(new Date(res.fechaSalida), "d MMM yyyy", { locale: es })}</span>
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${config.bg} ${config.color}`}>
              <Icon size={18} />
              <span className="text-sm font-semibold">{config.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ESTE ES EL COMPONENTE QUE EXPORTAMOS A ASTRO (La Isla Única)
export const DashboardApp = ({ token }: { token: string }) => {
  // 1. Configuramos el token nada más arrancar
  setAuthToken(token); 
  
  // 2. Iniciamos el cliente
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
  }));

  // 3. Envolvemos la interfaz visual con el Proveedor
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h2>
        <ReservationListContent />
      </div>
    </QueryClientProvider>
  );
};