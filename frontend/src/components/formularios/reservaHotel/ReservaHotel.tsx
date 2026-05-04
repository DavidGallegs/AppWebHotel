import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionFechas } from "./SeccionFechas";
import { SeccionTitular } from "./SeccionTitular";
import { esquemaReserva, type TReserva } from "./esquemaReserva"; 
import "../../../styles/reservaHotel.css";

export default function ReservaHotel() {

    // 1. Quitamos <TReserva> y dejamos que zodResolver haga la magia.
    // 2. Añadimos habitacion: "1" para calmar a TypeScript.
    const methods = useForm({
        resolver: zodResolver(esquemaReserva),
        defaultValues: { 
            habitacion: "1", 
            numPersonas: 1 
        }
    });

    // 3. Tipamos 'data' como 'any' y le confirmamos que es 'TReserva' dentro
    const enviar = async (data: any) => {
        const payloadLimpio = structuredClone(data as TReserva);

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
            const respuesta = await fetch("http://localhost:8000/api/reservas", { 
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
            alert("Reserva creada correctamente. Ahora registre a los viajeros.");

            // Opcional: Limpiar el formulario tras enviarlo
            methods.reset();

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