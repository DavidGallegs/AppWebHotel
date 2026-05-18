import { ClipboardList, Users, Calendar, Ban, Terminal } from 'lucide-react';

interface SidebarProps {
  pestañaActiva: string;
  setTab: (tab: any) => void;
}

const AdminSidebar = ({ pestañaActiva, setTab }: SidebarProps) => {
  const tabs = [
    { id: 'reservas', label: 'Listado de Reservas', icon: ClipboardList },
    { id: 'walkin', label: 'Check-in Directo', icon: Users },
    { id: 'nuevaReserva', label: 'Reserva Manual', icon: Calendar },
    { id: 'vacaciones', label: 'Bloquear Fechas', icon: Ban },
    { id: 'logs', label: 'Consola SES', icon: Terminal }, 
  ];

  return (
    <aside className="admin-sidebar">
      <h2 className="admin-logo">Admin Rural</h2>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`admin-nav-btn ${pestañaActiva === tab.id ? 'active' : ''}`}
        >
          <tab.icon size={20} /> {tab.label}
        </button>
      ))}
    </aside>
  );
};

export default AdminSidebar;