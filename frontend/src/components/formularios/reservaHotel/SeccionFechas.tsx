import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfToday, parseISO, startOfDay, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { type TReserva } from "./esquemaReserva";

interface Props {
    reservaId?: string | number;
}

export function SeccionFechas({ reservaId }: Props) {
    const { setValue, control, register } = useFormContext<TReserva>();
    const habitacionSeleccionada = useWatch({ control, name: "habitacion" });
    
    const fechaEntradaActual = useWatch({ control, name: "fechaEntrada" });
    const fechaSalidaActual = useWatch({ control, name: "fechaSalida" });

    const [range, setRange] = useState<DateRange | undefined>(() => {
        if (fechaEntradaActual && fechaSalidaActual) {
            return { from: parseISO(fechaEntradaActual), to: parseISO(fechaSalidaActual) };
        }
        return undefined;
    });

    // Cambiamos el estado para guardar directamente fechas (Date)
    const [diasBloqueados, setDiasBloqueados] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargarOcupacion = async () => {
            setIsLoading(true);
            try {
                const url = `http://localhost:8000/api/ocupacion?habitacion=${habitacionSeleccionada}${reservaId ? `&exclude_reserva=${reservaId}` : ''}`;
                const res = await fetch(url);
                const data = await res.json();
                
                // Mapeamos el array diasOcupados a objetos Date de JavaScript
                if (data.diasOcupados && Array.isArray(data.diasOcupados)) {
                    const fechas = data.diasOcupados.map((fechaString: string) => startOfDay(parseISO(fechaString)));
                    setDiasBloqueados(fechas);
                } else {
                    setDiasBloqueados([]);
                }

            } catch (error) {
                console.error("Error cargando ocupación:", error);
                setDiasBloqueados([]); 
            } finally {
                setIsLoading(false);
            }
        };

        if (habitacionSeleccionada) {
            cargarOcupacion();
        }
    }, [habitacionSeleccionada, reservaId]);

    const handleRangeSelect = (newRange: DateRange | undefined) => {
        // Validación: Comprobar si en el rango seleccionado hay algún día bloqueado
        if (newRange?.from && newRange?.to) {
            const solapa = diasBloqueados.some(diaBloqueado => {
                // Comprobamos si el día bloqueado cae estrictamente dentro del rango seleccionado
                return diaBloqueado > startOfDay(newRange.from!) && diaBloqueado < startOfDay(newRange.to!);
            });

            if (solapa) {
                alert("Has seleccionado un rango que incluye días ya ocupados. Por favor, elige otras fechas.");
                setRange({ from: newRange.from, to: undefined });
                setValue("fechaEntrada", format(newRange.from, "yyyy-MM-dd"));
                setValue("fechaSalida", "");
                return;
            }
        }

        setRange(newRange);
        
        if (newRange?.from) setValue("fechaEntrada", format(newRange.from, "yyyy-MM-dd"));
        else setValue("fechaEntrada", "");

        if (newRange?.to) setValue("fechaSalida", format(newRange.to, "yyyy-MM-dd"));
        else setValue("fechaSalida", "");
    };

    return (
        <fieldset className="seccion-fechas">
            <legend>Reserva de Habitación</legend>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Seleccione Habitación:</label>
                <select {...register("habitacion")}>
                    <option value="1">Habitación 1 Norte - 50€/noche</option>
                    <option value="2">Habitación 2 Sur - 60€/noche</option>
                </select>
            </div>

            <div className="calendario-container" style={{ position: 'relative', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                {isLoading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '8px', zIndex: 10 }}>
                        Cargando disponibilidad...
                    </div>
                )}
                
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    locale={es}
                    // Le pasamos directamente el array de fechas bloqueadas
                    disabled={[
                        { before: startOfToday() }, 
                        ...diasBloqueados             
                    ]}
                    // Aplicamos el estilo rojo a las fechas bloqueadas
                    modifiers={{ ocupado: diasBloqueados }}
                    modifiersStyles={{
                        ocupado: { 
                            color: '#ef4444', 
                            backgroundColor: '#fee2e2',
                            textDecoration: 'line-through',
                            fontWeight: 'bold'
                        }
                    }}
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