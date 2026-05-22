import { useState } from 'react';
import { FileBadge, Search, Eye, X } from 'lucide-react';
import { useAdmin } from './useAdmin';
import { format } from 'date-fns';

/* * COMPONENTE: AdminTabSES
 * Propósito: Muestra el historial de transmisiones a las autoridades. 
 * Vital para auditorías legales de la casa rural.
 */
export default function AdminTabSES() {

  const { sesData } = useAdmin(); 
  const [detalleSES, setDetalleSES] = useState<any | null>(null);

  const getEstadoSESClass = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'NOTIFICADO': return 'badge badge-finished'; 
      case 'PENDIENTE': return 'badge badge-pending'; 
      case 'ANULADO': return 'badge alert-cancel'; 
      case 'MODIFICADO': return 'badge btn-outline'; 
      case 'ERROR': return 'badge alert-cancel'; 
      default: return 'badge badge-pending';
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title">
        <FileBadge size={28} color="#3b82f6" aria-hidden="true" />
        <h2>Gestión y Estados SES (Hospederías)</h2>
      </div>

      <div className="admin-card">
        <p className="admin-text-muted mb-4">
          Estado de sincronización de las reservas con el sistema de las Fuerzas y Cuerpos de Seguridad.
        </p>

        {(!sesData || sesData.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }} role="status">
            <Search size={32} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} aria-hidden="true" />
            No hay información del SES disponible todavía.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Registro de transmisiones SES">
              <thead>
                <tr>
                  <th scope="col">ID Reserva</th>
                  <th scope="col">Titular</th>
                  <th scope="col">Estado SES</th>
                  <th scope="col">Lote / Fecha Envío</th>
                  <th scope="col">Relación</th>
                  <th scope="col">Acciones</th>
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
                        aria-label={`Ver detalles del lote para la reserva ${row.reserva_id}`}
                      >
                        <Eye size={14} aria-hidden="true" /> Ver Lote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL SES ACCESIBLE */}
      {detalleSES && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-ses-title">
          <div className="modal-card">
            <button onClick={() => setDetalleSES(null)} className="modal-close-btn" aria-label="Cerrar"><X size={24} aria-hidden="true" /></button>
            <h2 id="modal-ses-title" className="modal-header">Detalles SES - Reserva #{detalleSES.reserva_id}</h2>

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