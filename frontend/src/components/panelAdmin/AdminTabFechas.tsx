import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import { Ban, Loader2 } from 'lucide-react';
import { useAdmin } from './useAdmin';

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
      onSuccess: () => setRango(undefined) // Limpiar calendario tras éxito
    });
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Ban color="#ef4444" /> Bloqueo de Fechas
      </h2>
      <div className="bloqueo-grid">
        <div className="admin-card">
          <label className="form-label">Seleccionar Habitación:</label>
          <select value={habitacionId} onChange={(e) => setHabitacionId(e.target.value)} className="form-select">
            <option value="1">Habitación 1 (Norte)</option>
            <option value="2">Habitación 2 (Sur)</option>
          </select>

          <div className="calendar-wrapper" style={{ position: 'relative' }}>
            {estaCargandoOcupacion && (
              <div className="loader-overlay"><Loader2 className="animate-spin" /></div>
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
        </div>

        <div className="summary-card">
          <h4>Resumen</h4>
          <p><strong>Desde:</strong> {rango?.from ? format(rango.from, 'dd/MM/yyyy') : '-'}</p>
          <p><strong>Hasta:</strong> {rango?.to ? format(rango.to, 'dd/MM/yyyy') : '-'}</p>
          <button 
            onClick={handleBloquear} 
            disabled={!rango?.from || mutations.bloquearFechas.isPending} 
            className="btn-action btn-danger"
          >
            {mutations.bloquearFechas.isPending ? 'Procesando...' : 'Confirmar Bloqueo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTabFechas;