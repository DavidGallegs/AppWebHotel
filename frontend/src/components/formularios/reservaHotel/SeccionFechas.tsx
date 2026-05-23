import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfToday, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
    reservaId?: string | number;
}

/* * COMPONENTE: SeccionFechas
 * Propósito: Muestra el calendario interactivo, bloquea los días que ya están ocupados en la base de datos 
 * y calcula el rango de fechas que elige el cliente.
 */
export function SeccionFechas({ reservaId }: Props) {
    const { setValue, control, register } = useFormContext<any>();
    
    // Observamos "en vivo" qué habitación está seleccionada y qué fechas tenemos actualmente
    const habitacionSeleccionada = useWatch({ control, name: "habitacion" });
    const fechaEntradaActual = useWatch({ control, name: "fechaEntrada" });
    const fechaSalidaActual = useWatch({ control, name: "fechaSalida" });

    // Estado del rango de fechas del calendario. Si ya había fechas en el formulario (por ej. al editar), las carga.
    const [range, setRange] = useState<DateRange | undefined>(() => {
        if (fechaEntradaActual && fechaSalidaActual) {
            return { from: parseISO(fechaEntradaActual), to: parseISO(fechaSalidaActual) };
        }
        return undefined;
    });

    const [diasBloqueados, setDiasBloqueados] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    /* * EFECTO: Cargar Ocupación
     * Cuándo ocurre: Cada vez que el componente se carga por primera vez, o si el usuario cambia de la Habitación 1 a la 2.
     * Qué hace: Le pregunta a tu API de Laravel qué fechas están ocupadas para tacharlas en el calendario.
     */
    useEffect(() => {
        const cargarOcupacion = async () => {
            setIsLoading(true);
            try {
                const url = `${import.meta.env.PUBLIC_API_URL}/api/ocupacion?habitacion=${habitacionSeleccionada}${reservaId ? `&exclude_reserva=${reservaId}` : ''}`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.diasOcupados && Array.isArray(data.diasOcupados)) {
                    // Convertimos los strings de fecha (ej: "2024-05-10") a objetos Date que el calendario pueda entender
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

    /* * FUNCIÓN: handleRangeSelect
     * Qué hace: Cuando el usuario hace clic en el calendario, esta función analiza qué días ha elegido.
     * Si intenta hacer una reserva "saltando" por encima de un día ocupado (ej: entra el 1, sale el 5, pero el 3 está ocupado),
     * el sistema bloquea la acción para evitar overbooking.
     */
    const handleRangeSelect = (newRange: DateRange | undefined) => {
        if (newRange?.from && newRange?.to) {
            // Comprobamos si algún día bloqueado cae justo en medio del rango seleccionado
            const solapa = diasBloqueados.some(diaBloqueado => {
                return diaBloqueado > startOfDay(newRange.from!) && diaBloqueado < startOfDay(newRange.to!);
            });

            if (solapa) {
                alert("Has seleccionado un rango que incluye días ya ocupados. Por favor, elige otras fechas.");
                // Reseteamos la fecha de salida pero mantenemos la de entrada para que vuelva a intentar
                setRange({ from: newRange.from, to: undefined });
                setValue("fechaEntrada", format(newRange.from, "yyyy-MM-dd"));
                setValue("fechaSalida", "");
                return;
            }
        }

        setRange(newRange);
        
        // Sincronizamos las fechas que eligió en el calendario con las variables ocultas de React Hook Form
        if (newRange?.from) setValue("fechaEntrada", format(newRange.from, "yyyy-MM-dd"));
        else setValue("fechaEntrada", "");

        if (newRange?.to) setValue("fechaSalida", format(newRange.to, "yyyy-MM-dd"));
        else setValue("fechaSalida", "");
    };

    return (
        <fieldset className="seccion-fechas">
            <legend>Reserva de Habitación</legend>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                {/* Accesibilidad: Vinculamos el label con el select usando htmlFor y id */}
                <label htmlFor="selector-habitacion">Seleccione Habitación:</label>
                <select id="selector-habitacion" {...register("habitacion")}>
                    <option value="1">Habitación 1 Norte - 50€/noche</option>
                    <option value="2">Habitación 2 Sur - 60€/noche</option>
                </select>
            </div>

            <div className="calendario-container" style={{ position: 'relative', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }} aria-busy={isLoading}>
                {isLoading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '8px', zIndex: 10 }}>
                        <span aria-live="polite">Cargando disponibilidad...</span>
                    </div>
                )}
                
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    locale={es}
                    // Desactivamos los días anteriores a hoy y todos los que trajimos del backend
                    disabled={[{ before: startOfToday() }, ...diasBloqueados]}
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

            {/* Este bloque solo es para darle feedback visual al usuario de lo que está haciendo */}
            <div className="seleccion-info" aria-live="polite">
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
            
            {/* Estos inputs ocultos son los que realmente viajan en el formulario cuando le das a enviar */}
            <input type="hidden" {...register("fechaEntrada")} />
            <input type="hidden" {...register("fechaSalida")} />
        </fieldset>
    );
}