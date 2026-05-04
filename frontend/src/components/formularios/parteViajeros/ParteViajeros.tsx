import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionViajero } from "./SeccionViajero";
import { esquemaParteViajeros, type TParteViajeros } from "./esquemaViajeros"; 

// 1. Añadimos la interfaz para que acepte el ID de la reserva opcionalmente
interface Props {
    reservaId?: string | number;
}

export default function ParteViajeros({ reservaId }: Props) {
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

        if (payloadLimpio.viajeros && payloadLimpio.viajeros.length > 0) {
            payloadLimpio.viajeros = payloadLimpio.viajeros.map(viajero => {
                if (viajero.pais === "ESP") delete viajero.nombreMunicipio;
                else delete viajero.codigoMunicipio;
                return viajero;
            });
        }

        // 2. Empaquetamos los datos limpios JUNTO con el ID de la reserva
        const payloadFinal = {
            ...payloadLimpio,
            reserva_id: reservaId 
        };

        try {
            const respuesta = await fetch("http://localhost:8000/api/viajeros", { 
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                // 3. Enviamos el payload final
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
            alert("Parte de viajeros enviado correctamente.");

            // Opcional: limpiar el formulario tras enviarlo con éxito
            methods.reset();

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al enviar los datos de los viajeros.");
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
                            <button type="submit">Enviar Parte de Viajeros</button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}