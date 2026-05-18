import { Terminal, RefreshCw } from 'lucide-react';
import { useAdmin } from './useAdmin';
import { format } from 'date-fns';

export default function AdminTabLogs() {
  const { logs } = useAdmin();

  // Función auxiliar para darle color según el estado
  const getColorPorEstado = (estado: string) => {
    if (estado?.toUpperCase() === 'OK') return '#4ade80'; // Verde
    if (estado?.toUpperCase() === 'ERROR') return '#f87171'; // Rojo
    return '#9ca3af'; // Gris por defecto
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={28} color="#3b82f6" />
          <h2>Consola de Procesos SES</h2>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#1e1e1e', border: '1px solid #374151' }}>
        <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem 1rem', borderBottom: '1px solid #3f3f46', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          </div>
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem', fontFamily: 'monospace' }}>server-logs / SES</span>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem', color: '#e4e4e7', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {(!logs || logs.length === 0) ? (
            <div style={{ color: '#71717a' }}>&gt; Esperando eventos del sistema...</div>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px dashed #3f3f46', paddingBottom: '8px' }}>
                <span style={{ color: '#71717a', minWidth: '140px' }}>
                  {log.fecha ? format(new Date(log.fecha), 'dd/MM/yyyy HH:mm') : '-'}
                </span>
                <span style={{ color: '#60a5fa', minWidth: '60px' }}>ID {log.id}</span>
                <span style={{ color: '#d4d4d8', minWidth: '120px' }}>[Reserva #{log.reserva_id}]</span>
                <span style={{ color: getColorPorEstado(log.estado), fontWeight: 'bold', minWidth: '80px' }}>
                  {log.estado}
                </span>
                <span style={{ color: '#e4e4e7' }}>{log.mensaje || log.accion}</span>
              </div>
            ))
          )}
          
          {/* Falso cursor parpadeante de consola */}
          <div style={{ marginTop: '10px', color: '#71717a' }}>&gt; <span className="animate-pulse">_</span></div>
        </div>
      </div>
    </div>
  );
}