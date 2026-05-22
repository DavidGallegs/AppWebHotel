import { ClipboardList, Users, Calendar, Ban, Terminal } from 'lucide-react';

interface SidebarProps {
  pestañaActiva: string;
  setTab: (tab: any) => void;
}

/* * COMPONENTE: AdminSidebar
 * Propósito: Menú lateral de navegación. No usa React Router, sino que 
 * cambia el estado del componente padre para simular el cambio de páginas.
 */
const AdminSidebar = ({ pestañaActiva, setTab }: SidebarProps) => {
  const tabs = [
    { id: 'reservas', label: 'Listado de Reservas', icon: ClipboardList },
    { id: 'walkin', label: 'Check-in Directo', icon: Users },
    { id: 'nuevaReserva', label: 'Reserva Manual', icon: Calendar },
    { id: 'vacaciones', label: 'Bloquear Fechas', icon: Ban },
    { id: 'ses', label: 'Consola SES', icon: Terminal }, // Corregido 'logs' a 'ses' para mantener coherencia
  ];

  return (
    // Un menú lateral debe ser semánticamente un 'nav'
    <nav className="admin-sidebar" aria-label="Menú de administración principal">
      <h2 className="admin-logo">Admin Rural</h2>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`admin-nav-btn ${pestañaActiva === tab.id ? 'active' : ''}`}
          // ACCESIBILIDAD: Indica al lector de pantalla qué pestaña está activa
          aria-current={pestañaActiva === tab.id ? "page" : undefined}
        >
          <tab.icon size={20} aria-hidden="true" /> {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default AdminSidebar;