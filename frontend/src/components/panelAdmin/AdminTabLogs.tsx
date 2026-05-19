import { Activity } from 'lucide-react';
import { useAdmin } from './useAdmin';
import { format } from 'date-fns';

export default function AdminTabLogs() {
  const { logs } = useAdmin();

  // Asignamos colores a los estados reutilizando el CSS que ya tienes
  const getBadgeClass = (estado: string) => {
    const est = estado?.toUpperCase();
    if (est === 'OK') return 'badge badge-finished'; // Verde (completado)
    if (est === 'ERROR') return 'badge alert-cancel'; // Rojo (error)
    return 'badge badge-pending'; // Naranja (otros)
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title">
        {/* Cambié el icono de Terminal por Activity, que pega más con un historial */}
        <Activity size={28} color="#3b82f6" />
        <h2>Historial de Procesos (SES)</h2>
      </div>

      <div className="admin-card">
        <div className="section-header-sm">
          <p className="admin-text-muted">
            Registro de todas las comunicaciones y envíos automáticos realizados al sistema de la policía.
          </p>
        </div>

        {(!logs || logs.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
            No hay eventos registrados en el historial todavía.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>ID Proceso / Reserva</th>
                  <th>Estado</th>
                  <th>Detalles del Evento</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    
                    {/* FECHA */}
                    <td className="admin-text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {log.fecha ? format(new Date(log.fecha), 'dd/MM/yyyy HH:mm') : '-'}
                    </td>
                    
                    {/* IDENTIFICADORES */}
                    <td>
                      <div className="admin-text-semibold">Log #{log.id}</div>
                      <div className="admin-text-muted">Reserva: {log.reserva_id}</div>
                    </td>
                    
                    {/* ESTADO (Con etiqueta de color) */}
                    <td>
                      <span className={getBadgeClass(log.estado)}>
                        {log.estado}
                      </span>
                    </td>
                    
                    {/* MENSAJE Y ACCIÓN */}
                    <td>
                      <div className="admin-text-semibold">{log.accion}</div>
                      <div className="admin-text-muted">{log.mensaje}</div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}