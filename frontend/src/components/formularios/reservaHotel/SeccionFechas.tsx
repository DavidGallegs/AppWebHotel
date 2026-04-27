import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, isBefore, startOfToday, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { type TReserva } from "./esquemaReserva";

const cssModificadores = `
  .rdp-day_disabled { color: red; opacity: 1; } 
  .rdp-day:not(.rdp-day_disabled) { font-weight: bold; }
  .seleccion-info { margin-top: 10px; font-size: 0.9em; color: #555; }
`;

export function SeccionFechas() {
    const { setValue, control, register } = useFormContext<TReserva>();
    
    // Observamos qué habitación está seleccionada
    const habitacionSeleccionada = useWatch({ control, name: "habitacion" });
    
    // Estados para la lógica del calendario
    const [range, setRange] = useState<DateRange | undefined>();
    const [diasOcupados, setDiasOcupados] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Efecto para obtener días ocupados del backend cuando cambia la habitación
    useEffect(() => {
        const cargarOcupacion = async () => {
            setIsLoading(true);
            try {
                // Simulación del fetch que acordamos
                const res = await fetch(`http://localhost:8000/api/ocupacion?habitacion=${habitacionSeleccionada}`);
                const data = await res.json();
                
                // Convertimos los strings ISO en objetos Date de JS
                const fechas = data.diasOcupados.map((fechaStr: string) => parseISO(fechaStr));
                setDiasOcupados(fechas);
            } catch (error) {
                console.error("Error cargando ocupación:", error);
                // Mock temporal por si el backend no está listo todavía
                setDiasOcupados([]); 
            } finally {
                setIsLoading(false);
            }
        };

        cargarOcupacion();
    }, [habitacionSeleccionada]);

    // Función que se ejecuta al hacer click en el calendario
    const handleRangeSelect = (newRange: DateRange | undefined) => {
        setRange(newRange);
        
        // Si tenemos fecha de inicio, la guardamos en el formulario
        if (newRange?.from) {
            setValue("fechaEntrada", format(newRange.from, "yyyy-MM-dd"));
        } else {
            setValue("fechaEntrada", "");
        }

        // Si tenemos fecha de fin, la guardamos
        if (newRange?.to) {
            setValue("fechaSalida", format(newRange.to, "yyyy-MM-dd"));
        } else {
            setValue("fechaSalida", "");
        }
    };

    return (
        <fieldset className="seccion-fechas">
            <legend>Reserva de Habitación</legend>
            <style>{cssModificadores}</style>

            <div className="input-group">
                <label>Seleccione Habitación:</label>
                <select {...register("habitacion")}>
                    <option value="1">Habitación 1</option>
                    <option value="2">Habitación 2</option>
                </select>
            </div>

            {isLoading ? (
                <p>Actualizando calendario...</p>
            ) : (
                <div className="calendario-container">
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={handleRangeSelect}
                        locale={es}
                        disabled={[
                            { before: startOfToday() }, // No permite días pasados
                            ...diasOcupados             // No permite días ocupados
                        ]}
                        modifiers={{ ocupado: diasOcupados }}
                        modifiersStyles={{ ocupado: { color: 'red' } }}
                    />
                </div>
            )}

            <div className="seleccion-info">
                {range?.from ? (
                    range.to ? (
                        <p>Has elegido del <strong>{format(range.from, "dd/MM/yyyy")}</strong> al <strong>{format(range.to, "dd/MM/yyyy")}</strong></p>
                    ) : (
                        <p>Selecciona la fecha de salida...</p>
                    )
                ) : (
                    <p>Por favor, selecciona una fecha de entrada.</p>
                )}
            </div>
            
            {/* Inputs ocultos para que react-hook-form siga recibiendo los datos */}
            <input type="hidden" {...register("fechaEntrada")} />
            <input type="hidden" {...register("fechaSalida")} />
        </fieldset>
    );
}