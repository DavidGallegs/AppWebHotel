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
      onSuccess: () => setRango(undefined)
    });
  };

  return (
    <div className="fade-in">
      <div className="admin-page-title">
        <Ban color="#ef4444" />
        <h2>Bloqueo de Fechas</h2>
      </div>

      <div className="bloqueo-grid">
        {/* COLUMNA IZQUIERDA: Formulario y Calendario */}
        <div className="admin-card">
          <label className="form-label">Seleccionar Habitación:</label>
          <select value={habitacionId} onChange={(e) => setHabitacionId(e.target.value)} className="form-select mb-4">
            <option value="1">Habitación 1 (Norte)</option>
            <option value="2">Habitación 2 (Sur)</option>
          </select>

          <div className="calendar-wrapper">
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

        {/* COLUMNA DERECHA: Resumen en forma de torre */}
        <div className="summary-card tower-layout">
          <div>
            <h4 className="modal-section-title">Resumen</h4>
            <div className="flex-column-gap" style={{ marginTop: '1.5rem' }}>
              <p><strong>Desde:</strong> {rango?.from ? format(rango.from, 'dd/MM/yyyy') : '-'}</p>
              <p><strong>Hasta:</strong> {rango?.to ? format(rango.to, 'dd/MM/yyyy') : '-'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleBloquear} 
            disabled={!rango?.from || mutations.bloquearFechas.isPending} 
            className="btn-action btn-danger btn-tower"
          >
            {mutations.bloquearFechas.isPending ? 'Procesando...' : 'Confirmar Bloqueo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTabFechas;