import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionViajero } from "./SeccionViajero";
import { esquemaParteViajeros, type TParteViajeros } from "./esquemaViajeros"; 
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../dashboard/api";

// 1. NUEVO: Añadimos 'maxViajeros' a las propiedades que recibe el componente
interface Props {
    reservaId?: string | number;
    isAdmin?: boolean; 
    maxViajeros: number; 
}

export default function ParteViajeros({ reservaId, isAdmin = false, maxViajeros }: Props) {
    const queryClient = useQueryClient();

    const methods = useForm<TParteViajeros>({
        resolver: zodResolver(esquemaParteViajeros),
        defaultValues: { viajeros: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "viajeros"
    });

    // 2. NUEVO: Calculamos si ya hemos llegado al límite
    const limiteAlcanzado = fields.length >= maxViajeros;

    const enviar: SubmitHandler<TParteViajeros> = async (data) => {
        const payloadLimpio = structuredClone(data);

        if (payloadLimpio.viajeros && payloadLimpio.viajeros.length > 0) {
            payloadLimpio.viajeros = payloadLimpio.viajeros.map(viajero => {
                if (viajero.pais === "ESP") delete viajero.nombreMunicipio;
                else delete viajero.codigoMunicipio;
                return viajero;
            });
        }

        const endpoint = isAdmin 
            ? `/admin/reservations/${reservaId}/checkin` 
            : `/reservations/${reservaId}/checkin`;

        try {
            await api.post(endpoint, { 
                reserva_id: reservaId,
                viajeros: payloadLimpio.viajeros 
            });

            alert("Check-in completado y Parte de Viajeros enviado correctamente.");
            methods.reset();

            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['user-reservations'] }); // Corregido para sincronizar con tu dashboard

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al procesar el check-in.");
        }
    };

    return (
        <section className="container-form" aria-labelledby="titulo-formulario-viajeros">
            <h2 id="titulo-formulario-viajeros" style={{ display: 'none' }}>Formulario de Parte de Viajeros</h2>
            
            <FormProvider {...methods}>
                <form className="form" onSubmit={methods.handleSubmit(enviar)} noValidate>
                    
                    {fields.map((field, index) => (
                        <SeccionViajero key={field.id} index={index} remover={() => remove(index)} />
                    ))}

                    <div className="acciones-formulario">
                        {/* 3. NUEVO: Si no hemos llegado al límite, mostramos el botón de añadir */}
                        {!limiteAlcanzado ? (
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
                                + Rellenar parte viajeros ({fields.length}/{maxViajeros})
                            </button>
                        ) : (
                            <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
                                Has alcanzado el límite de <strong>{maxViajeros}</strong> viajeros para esta reserva.
                            </div>
                        )}
                        
                        {fields.length > 0 && (
                            <button 
                                type="submit" 
                                className="btn-action btn-approve" 
                                style={{ width: '100%', marginTop: '1rem' }}
                                aria-label="Enviar datos y finalizar check-in"
                            >
                                Enviar Parte de Viajeros y Finalizar
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </section>
    );
}