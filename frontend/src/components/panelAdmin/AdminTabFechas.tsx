import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import { Ban, Loader2 } from 'lucide-react';
import { useAdmin } from './useAdmin';

/* * COMPONENTE: AdminTabFechas
 * Propósito: Permite al administrador cerrar habitaciones por mantenimiento,
 * vacaciones o problemas, evitando que los clientes puedan reservarlas.
 */
const AdminTabFechas = () => {
  const [habitacionId, setHabitacionId] = useState("1");
  const [rango, setRango] = useState<DateRange | undefined>();
  const { ocupacion, estaCargandoOcupacion, mutations } = useAdmin(habitacionId);

  const handleBloquear = () => {
    if (!rango?.from || !rango?.to) return;
    
    mutations.bloquearFechas.mutate({
      habitacion_id: habitacionId,
      fechaInicio: format(rango.from, 'yyyy-MM-dd'),
      fechaFin: format(rango.to, 'yyyy-MM-dd')
    }, {
      onSuccess: () => setRango(undefined)
    });
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title">
        <Ban color="#ef4444" aria-hidden="true" />
        <h2>Bloqueo de Fechas</h2>
      </div>

      <div className="bloqueo-grid">
        <section className="admin-card">
          <label className="form-label" htmlFor="select-habitacion-bloqueo">Seleccionar Habitación:</label>
          <select id="select-habitacion-bloqueo" value={habitacionId} onChange={(e) => setHabitacionId(e.target.value)} className="form-select mb-4">
            <option value="1">Habitación 1 (Norte)</option>
            <option value="2">Habitación 2 (Sur)</option>
          </select>

          <div className="calendar-wrapper" aria-busy={estaCargandoOcupacion}>
            {estaCargandoOcupacion && (
              <div className="loader-overlay" role="status" aria-label="Cargando calendario">
                  <Loader2 className="animate-spin" aria-hidden="true" />
              </div>
            )}
            <DayPicker 
              mode="range" 
              selected={rango} 
              onSelect={setRango} 
              locale={es}
              disabled={[{ before: new Date() }, ...(ocupacion || [])]}
              modifiers={{ ocupado: ocupacion || [] }}
              modifiersClassNames={{ ocupado: 'day-picker-occupied' }}
            />
          </div>
        </section>

        <aside className="summary-card tower-layout">
          <div>
            <h4 className="modal-section-title">Resumen</h4>
            <div className="flex-column-gap" style={{ marginTop: '1.5rem' }} aria-live="polite">
              <p><strong>Desde:</strong> {rango?.from ? format(rango.from, 'dd/MM/yyyy') : '-'}</p>
              <p><strong>Hasta:</strong> {rango?.to ? format(rango.to, 'dd/MM/yyyy') : '-'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleBloquear} 
            disabled={!rango?.from || mutations.bloquearFechas.isPending} 
            className="btn-action btn-danger btn-tower"
            aria-busy={mutations.bloquearFechas.isPending}
          >
            {mutations.bloquearFechas.isPending ? 'Procesando...' : 'Confirmar Bloqueo'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default AdminTabFechas;