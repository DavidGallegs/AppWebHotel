import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfToday, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { type TReserva } from "./esquemaReserva";

interface Props {
    reservaId?: string | number; // Recibimos el ID para excluirlo de las ocupaciones
}

interface RangoReserva {
    fechaEntrada: string;
    fechaSalida: string;
}

export function SeccionFechas({ reservaId }: Props) {
    const { setValue, control, register } = useFormContext<TReserva>();
    const habitacionSeleccionada = useWatch({ control, name: "habitacion" });
    
    // Si ya hay valores en el formulario (por ejemplo, al editar), los usamos para pintar el calendario inicial
    const fechaEntradaActual = useWatch({ control, name: "fechaEntrada" });
    const fechaSalidaActual = useWatch({ control, name: "fechaSalida" });

    const [range, setRange] = useState<DateRange | undefined>(() => {
        if (fechaEntradaActual && fechaSalidaActual) {
            return { from: parseISO(fechaEntradaActual), to: parseISO(fechaSalidaActual) };
        }
        return undefined;
    });

    const [reservasConfirmadas, setReservasConfirmadas] = useState<RangoReserva[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargarOcupacion = async () => {
            setIsLoading(true);
            try {
                // Fetch hacia tu backend. Pasamos el reservaId para excluirlo de la respuesta.
                const url = `http://localhost:8000/api/ocupacion?habitacion=${habitacionSeleccionada}${reservaId ? `&exclude_reserva=${reservaId}` : ''}`;
                const res = await fetch(url);
                const data = await res.json();
                
                // Esperamos que el backend devuelva { reservas: [{ fechaEntrada: '...', fechaSalida: '...' }] }
                setReservasConfirmadas(data.reservas || []);
            } catch (error) {
                console.error("Error cargando ocupación:", error);
                setReservasConfirmadas([]); 
            } finally {
                setIsLoading(false);
            }
        };

        cargarOcupacion();
    }, [habitacionSeleccionada, reservaId]);

    const handleRangeSelect = (newRange: DateRange | undefined) => {
        // Lógica para detectar solapamientos si selecciona un rango completo
        if (newRange?.from && newRange?.to) {
            const solapa = reservasConfirmadas.some(res => {
                const resIn = startOfDay(parseISO(res.fechaEntrada));
                const resOut = startOfDay(parseISO(res.fechaSalida));
                const myIn = startOfDay(newRange.from!);
                const myOut = startOfDay(newRange.to!);

                // Hay solapamiento si mi entrada es estrictamente ANTES de su salida, 
                // Y mi salida es estrictamente DESPUÉS de su entrada.
                return myIn < resOut && myOut > resIn;
            });

            if (solapa) {
                alert("Las fechas seleccionadas abarcan días ya ocupados. Solo puedes coincidir en el día de entrada o salida.");
                // Reseteamos el rango al primer clic para que vuelva a intentar
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

    // Deshabilita SOLO las noches intermedias, dejando clicables los días de check-in y check-out
    const isDateFullyDisabled = (date: Date) => {
        const d = startOfDay(date);
        return reservasConfirmadas.some(res => {
            const resIn = startOfDay(parseISO(res.fechaEntrada));
            const resOut = startOfDay(parseISO(res.fechaSalida));
            return d > resIn && d < resOut;
        });
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

            <div className="calendario-container" style={{ position: 'relative', opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.2s ease-in-out' }}>
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
                    disabled={(date) => {
                        const d = startOfDay(date);

                        // bloquear pasado
                        if (d < startOfToday()) return true;

                        // bloquear ocupados (INCLUYE extremos)
                        return reservasConfirmadas.some(res => {
                            const resIn = startOfDay(parseISO(res.fechaEntrada));
                            const resOut = startOfDay(parseISO(res.fechaSalida));

                            return d >= resIn && d <= resOut;
                        });
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