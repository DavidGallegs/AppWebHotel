import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css"; // <-- Importación base del calendario
import { format, startOfToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { type TReserva } from "./esquemaReserva";

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
                // Fetch hacia tu backend
                const res = await fetch(`http://localhost:8000/api/ocupacion?habitacion=${habitacionSeleccionada}`);
                const data = await res.json();
                
                // Convertimos los strings ISO en objetos Date de JS
                const fechas = data.diasOcupados.map((fechaStr: string) => parseISO(fechaStr));
                setDiasOcupados(fechas);
            } catch (error) {
                console.error("Error cargando ocupación:", error);
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

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Seleccione Habitación:</label>
                <select {...register("habitacion")}>
                    <option value="1">Habitación 1</option>
                    <option value="2">Habitación 2</option>
                </select>
            </div>

            <div 
                className="calendario-container" 
                style={{ 
                    position: 'relative',
                    opacity: isLoading ? 0.5 : 1, 
                    pointerEvents: isLoading ? 'none' : 'auto', 
                    transition: 'opacity 0.2s ease-in-out' 
                }}
            >
                {/* Un pequeño cartel de "Cargando" flotante encima del calendario */}
                {isLoading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, color: '#2563eb', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        Actualizando fechas...
                    </div>
                )}
                
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    locale={es}
                    disabled={[
                        { before: startOfToday() }, 
                        ...diasOcupados             
                    ]}
                />
            </div>

            <div className="seleccion-info">
                {range?.from ? (
                    range.to ? (
                        <p>Has elegido del <strong>{format(range.from, "dd/MM/yyyy")}</strong> al <strong>{format(range.to, "dd/MM/yyyy")}</strong></p>
                    ) : (
                        <p>Selecciona la fecha de salida...</p>
                    )
                ) : (
                    <p>Por favor, selecciona una fecha de entrada en el calendario.</p>
                )}
            </div>
            
            <input type="hidden" {...register("fechaEntrada")} />
            <input type="hidden" {...register("fechaSalida")} />
        </fieldset>
    );
}