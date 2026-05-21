import { useState } from 'react';
import { FileBadge, Search, Eye, X } from 'lucide-react';
import { useAdmin } from './useAdmin';
import { format } from 'date-fns';

export default function AdminTabSES() {

  const { sesData } = useAdmin(); 
  
  // Estado para el modal de detalles
  const [detalleSES, setDetalleSES] = useState<any | null>(null);

  // Función para dar color a los estados del SES
  const getEstadoSESClass = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'NOTIFICADO': return 'badge badge-finished'; // Verde
      case 'PENDIENTE': return 'badge badge-pending'; // Naranja
      case 'ANULADO': return 'badge alert-cancel'; // Rojo claro
      case 'MODIFICADO': return 'badge btn-outline'; // Gris/Outline para reservas antiguas que fueron reemplazadas
      case 'ERROR': return 'badge alert-cancel'; // Rojo
      default: return 'badge badge-pending';
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title">
        <FileBadge size={28} color="#3b82f6" />
        <h2>Gestión y Estados SES (Hospederías)</h2>
      </div>

      <div className="admin-card">
        <p className="admin-text-muted mb-4">
          Estado de sincronización de las reservas con el sistema de las Fuerzas y Cuerpos de Seguridad.
        </p>

        {(!sesData || sesData.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
            <Search size={32} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
            No hay información del SES disponible todavía.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Reserva</th>
                  <th>Titular</th>
                  <th>Estado SES</th>
                  <th>Lote / Fecha Envío</th>
                  <th>Relación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sesData.map((row: any) => (
                  <tr key={row.id}>
                    <td>
                      <span className="admin-text-semibold">#{row.reserva_id}</span>
                    </td>
                    <td>{row.titular_nombre}</td>
                    <td>
                      <span className={getEstadoSESClass(row.estado_ses)}>
                        {row.estado_ses}
                      </span>
                    </td>
                    <td>
                      {row.estado_ses === 'PENDIENTE' ? (
                        <span className="admin-text-muted">A la espera de aprobación</span>
                      ) : (
                        <>
                          <div className="admin-text-semibold">{row.num_lote || 'Sin Lote'}</div>
                          <div className="admin-text-muted">
                            {row.fecha_envio ? format(new Date(row.fecha_envio), 'dd/MM/yyyy HH:mm') : '-'}
                          </div>
                        </>
                      )}
                    </td>
                    <td>
                      {/* LÓGICA DE RELACIÓN (ID 7 reemplazada por ID 9) */}
                      {row.sustituida_por && (
                        <span className="admin-alert-waiting" style={{ color: '#b45309' }}>
                          Sustituida por #{row.sustituida_por}
                        </span>
                      )}
                      {row.proviene_de && (
                        <span className="admin-text-muted" style={{ fontSize: '0.75rem' }}>
                          Modificación de #{row.proviene_de}
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => setDetalleSES(row)} 
                        className="btn-action btn-outline btn-small"
                      >
                        <Eye size={14} /> Ver Lote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PARA VER LOS DETALLES DEL LOTE Y EL SES */}
      {detalleSES && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button onClick={() => setDetalleSES(null)} className="modal-close-btn"><X size={24} /></button>
            <h2 className="modal-header">Detalles SES - Reserva #{detalleSES.reserva_id}</h2>

            <div className="modal-grid">
              <section className="modal-info-box">
                <h4 className="modal-section-title">Información de Transmisión</h4>
                <div className="grid-2-col">
                  <p><strong>Estado:</strong> <span className={getEstadoSESClass(detalleSES.estado_ses)}>{detalleSES.estado_ses}</span></p>
                  <p><strong>Nº Lote SES:</strong> {detalleSES.num_lote || 'N/A'}</p>
                  <p><strong>Fecha Envío:</strong> {detalleSES.fecha_envio ? format(new Date(detalleSES.fecha_envio), 'dd/MM/yyyy HH:mm') : 'No enviada'}</p>
                  <p><strong>Viajeros Notificados:</strong> {detalleSES.num_viajeros || 0}</p>
                </div>
              </section>

              {detalleSES.mensaje_backend && (
                <section>
                  <h4 className="modal-section-title">Log del Servidor</h4>
                  <div style={{ backgroundColor: '#111827', color: '#4ade80', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {detalleSES.mensaje_backend}
                  </div>
                </section>
              )}
            </div>

            <button onClick={() => setDetalleSES(null)} className="modal-footer-btn">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}