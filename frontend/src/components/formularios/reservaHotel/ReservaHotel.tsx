import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionFechas } from "./SeccionFechas";
import { SeccionTitular } from "./SeccionTitular";
import { esquemaReserva, type TReserva } from "./esquemaReserva"; 
import "../../../styles/reservaHotel.css";

/* * COMPONENTE: ReservaHotel
 * Propósito: Es el cerebro del formulario de creación de reservas.
 * Envuelve a los sub-componentes (Fechas y Titular) y maneja el momento en que el usuario hace clic en "Confirmar".
 */
export default function ReservaHotel() {

    // Inicializamos el formulario y lo conectamos con nuestro esquema de Zod.
    // Le damos valores por defecto para que no haya campos "undefined" de inicio.
    const methods = useForm({
        resolver: zodResolver(esquemaReserva),
        defaultValues: { 
            habitacion: "1", 
            numPersonas: 1 
        }
    });

    /* * FUNCIÓN: enviar
     * Qué hace: Intercepta los datos cuando el formulario es válido, los "limpia" 
     * para que la base de datos no reciba basura, y los manda al backend.
     */
    const enviar = async (data: any) => {
        // Hacemos una copia profunda de los datos para no modificar el estado original de React
        const payloadLimpio = structuredClone(data as TReserva);

        // Limpieza inteligente: Si es español, borramos el texto libre. Si es extranjero, borramos el código del buscador.
        if (payloadLimpio.titular.pais === "ESP") {
            delete payloadLimpio.titular.nombreMunicipio;
        } else {
            delete payloadLimpio.titular.codigoMunicipio;
        }

        // Le añadimos la fecha actual como la "fecha en la que se firmó/creó el contrato"
        const payloadFinal = {
            ...payloadLimpio,
            fechaContrato: new Date().toISOString().split('T')[0]
        };

        try {
            // Petición al servidor
            const respuesta = await fetch("http://localhost:8000/api/reservas", { 
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
            alert("Reserva creada correctamente. Ahora registre a los viajeros.");

            // Si todo fue bien, vaciamos el formulario para la siguiente reserva
            methods.reset();

        } catch (error) {
            console.error("Fallo al conectar con el backend:", error);
            alert("Hubo un error al enviar los datos.");
        }
    };

    return (

        <section className="container-form" aria-labelledby="titulo-reserva">
            <h2 id="titulo-reserva" style={{ display: 'none' }}>Formulario de Nueva Reserva</h2>
            
            {/* FormProvider reparte el poder del formulario a SeccionFechas y SeccionTitular */}
            <FormProvider {...methods}>
                <form className="form" onSubmit={methods.handleSubmit(enviar)} noValidate>
                    <SeccionFechas />
                    <SeccionTitular />
                    
                    <div className="acciones-formulario">
                        <button type="submit" aria-label="Confirmar la creación de esta reserva">
                            Confirmar Reserva
                        </button>
                    </div>
                </form>
            </FormProvider>
        </section>
    );
}