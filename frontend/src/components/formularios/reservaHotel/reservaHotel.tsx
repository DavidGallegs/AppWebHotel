import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionFechas } from "./SeccionFechas";
import { SeccionTitular } from "./SeccionTitular";
import { esquemaReserva, type TReserva } from "./esquemaReserva"; 
// import "../../styles/formulario.css";

export default function ReservaHotel() {
    const methods = useForm<TReserva>({
        resolver: zodResolver(esquemaReserva),
        defaultValues: { numPersonas: 1 }
    });

    const enviar: SubmitHandler<TReserva> = async (data) => {
        const payloadLimpio = structuredClone(data);

        if (payloadLimpio.titular.pais === "ESP") {
            delete payloadLimpio.titular.nombreMunicipio;
        } else {
            delete payloadLimpio.titular.codigoMunicipio;
        }

        const payloadFinal = {
            ...payloadLimpio,
            fechaContrato: new Date().toISOString().split('T')[0]
        };

        try {
            const respuesta = await fetch("http://localhost:8000/api/reservas", { // Ajusta tu endpoint
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
            alert("Reserva creada correctamente. Ahora registre a los viajeros.");
            
            // Aquí podrías emitir un evento, guardar en un estado global o redirigir
            // para que el usuario pase al formulario de ParteViajeros

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al enviar los datos.");
        }
    };

    return (
        <div className="container-form">
            <FormProvider {...methods}>
                <form className="form" onSubmit={methods.handleSubmit(enviar)}>
                    <SeccionFechas />
                    <SeccionTitular />
                    <div className="acciones-formulario">
                        <button type="submit">Confirmar Reserva</button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}