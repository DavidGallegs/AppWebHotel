import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionViajero } from "./SeccionViajero";
import { esquemaParteViajeros, type TParteViajeros } from "./esquemaViajeros"; 
import { useQueryClient } from "@tanstack/react-query";

// IMPORTANTE: Traemos tu configuración de axios que tiene el Token
import { api } from "../../dashboard/api";

interface Props {
    reservaId?: string | number;
    isAdmin?: boolean; // <-- NUEVO: Le decimos si el que lo abre es el Admin
}

export default function ParteViajeros({ reservaId, isAdmin = false }: Props) {
    const queryClient = useQueryClient();

    const methods = useForm<TParteViajeros>({
        resolver: zodResolver(esquemaParteViajeros),
        defaultValues: { viajeros: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "viajeros"
    });

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

        // 1. LA MAGIA: Elegimos la ruta correcta según quién lo use
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
            queryClient.invalidateQueries({ queryKey: ['reservations'] }); // Actualizado a tu key del usuario

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al procesar el check-in.");
        }
    };

    return (
        <div className="container-form">
            <FormProvider {...methods}>
                <form className="form" onSubmit={methods.handleSubmit(enviar)}>
                    
                    {fields.map((field, index) => (
                        <SeccionViajero key={field.id} index={index} remover={() => remove(index)} />
                    ))}

                    <div className="acciones-formulario">
                        <button 
                            type="button" 
                            className="btn-action"
                            style={{ background: '#3b82f6', color: 'white' }}
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
                            <button type="submit" className="btn-action btn-approve" style={{ width: '100%', marginTop: '1rem' }}>
                                Enviar Parte de Viajeros y Finalizar
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}