import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionViajero } from "./SeccionViajero";
import { esquemaParteViajeros, type TParteViajeros } from "./esquemaViajeros"; 
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../dashboard/api";

interface Props {
    reservaId?: string | number;
    isAdmin?: boolean; 
}

/* * COMPONENTE: ParteViajeros
 * Propósito: Gestiona el formulario completo donde se añaden múltiples viajeros a una reserva.
 * Actúa como "Proveedor" del contexto del formulario para los sub-componentes.
 */
export default function ParteViajeros({ reservaId, isAdmin = false }: Props) {
    const queryClient = useQueryClient();

    // Inicializamos el formulario y lo conectamos con Zod para las validaciones
    const methods = useForm<TParteViajeros>({
        resolver: zodResolver(esquemaParteViajeros),
        defaultValues: { viajeros: [] }
    });

    // Hook para manejar arrays de campos dinámicos (añadir/quitar viajeros)
    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "viajeros"
    });

    /*
     * FUNCIÓN: enviar
     * Propósito: Limpia los datos geográficos innecesarios y lanza la petición al backend.
     * Mantiene intacta la lógica de Axios y la invalidación de caché de React Query.
     */
    const enviar: SubmitHandler<TParteViajeros> = async (data) => {
        const payloadLimpio = structuredClone(data);

        // Limpieza de datos geográficos
        if (payloadLimpio.viajeros && payloadLimpio.viajeros.length > 0) {
            payloadLimpio.viajeros = payloadLimpio.viajeros.map(viajero => {
                if (viajero.pais === "ESP") delete viajero.nombreMunicipio;
                else delete viajero.codigoMunicipio;
                return viajero;
            });
        }

        // 1. Elegimos la ruta correcta según quién lo use
        const endpoint = isAdmin 
            ? `/admin/reservations/${reservaId}/checkin` 
            : `/reservations/${reservaId}/checkin`;

        try {
            // 2. Usamos 'api' para llevar el Token de seguridad a Laravel
            await api.post(endpoint, { 
                reserva_id: reservaId,
                viajeros: payloadLimpio.viajeros 
            });

            alert("Check-in completado y Parte de Viajeros enviado correctamente.");
            methods.reset();

            // Refrescamos las tablas
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] }); 

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al procesar el check-in.");
        }
    };

    return (
        // ACCESIBILIDAD: Usamos un <section> con un título oculto pero leíble por asistentes
        <section className="container-form" aria-labelledby="titulo-formulario-viajeros">
            <h2 id="titulo-formulario-viajeros" style={{ display: 'none' }}>Formulario de Parte de Viajeros</h2>
            
            <FormProvider {...methods}>
                <form className="form" onSubmit={methods.handleSubmit(enviar)} noValidate>
                    
                    {/* Renderizamos dinámicamente cada bloque de viajero */}
                    {fields.map((field, index) => (
                        <SeccionViajero key={field.id} index={index} remover={() => remove(index)} />
                    ))}

                    <div className="acciones-formulario">
                        <button 
                            type="button" 
                            className="btn-action"
                            style={{ background: '#3b82f6', color: 'white' }}
                            aria-label="Añadir un nuevo viajero al formulario"
                            onClick={() => append({ 
                                rol: "VI", nombre: "", apellido1: "", apellido2: "", 
                                tipoDocumento: "", numeroDocumento: "", soporteDocumento: "", 
                                fechaNacimiento: "", parentesco: "", direccion: "", 
                                codigoPostal: "", pais: "" 
                            })}
                        >
                            + Rellenar parte viajeros
                        </button>
                        
                        {fields.length > 0 && (
                            <button 
                                type="submit" 
                                className="btn-action btn-approve" 
                                style={{ width: '100%', marginTop: '1rem' }}
                                aria-label="Enviar datos y finalizar check-in">
                                Enviar Parte de Viajeros y Finalizar
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </section>
    );
}