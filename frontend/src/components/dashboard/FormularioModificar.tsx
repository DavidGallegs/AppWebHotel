import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas";
import { SeccionTitular } from "../formularios/reservaHotel/SeccionTitular";
import { esquemaReserva, type TReserva } from "../formularios/reservaHotel/esquemaReserva"; 
import type { FullReservation } from "./ReservationList"; 
import '../../styles/reservaHotel.css'

interface Props {
    reservaOriginal: FullReservation;
    onGuardar: (data: TReserva) => void;
    onCancelar: () => void;
    isPending: boolean;
    isAdmin?: boolean;      
    userEmail?: string;
}

/* * COMPONENTE: FormularioModificar
 * Propósito: Reutiliza los componentes que ya creamos en la reserva inicial (Fechas y Titular), 
 * pero los rellena (pre-carga) con los datos de una reserva existente para poder editarla.
 */
export function FormularioModificar({ reservaOriginal, onGuardar, onCancelar, isPending,isAdmin, userEmail }: Props) {
    
    /* * * Construimos el objeto inicial. 
     * Hacemos una comprobación profunda (con ?.) por si algunos datos del titular 
     * vienen vacíos o a nivel de la raíz de la reserva, evitando errores de "undefined".
     */
    const valoresIniciales: TReserva = {
        habitacion: (reservaOriginal.habitacion === "2" ? "2" : "1"),
        fechaEntrada: reservaOriginal.fechaEntrada || "",
        fechaSalida: reservaOriginal.fechaSalida || "",
        numPersonas: reservaOriginal.numPersonas ?? 1,
        titular: {
            rol: "TI",
            nombre: reservaOriginal.titular?.nombre || reservaOriginal.nombre || "",
            apellido1: reservaOriginal.titular?.apellido1 || reservaOriginal.apellido1 || "",
            apellido2: reservaOriginal.titular?.apellido2 || "",
            fechaNacimiento: reservaOriginal.titular?.fechaNacimiento || "",
            tipoDocumento: reservaOriginal.titular?.tipoDocumento || "",
            numeroDocumento: reservaOriginal.titular?.numeroDocumento || "",
            soporteDocumento: reservaOriginal.titular?.soporteDocumento || "",
            pais: (reservaOriginal.titular?.pais || "ESP"),
            direccion: reservaOriginal.titular?.direccion || "",
            codigoPostal: reservaOriginal.titular?.codigoPostal || "",
            telefono: reservaOriginal.titular?.telefono || "",
            correo: reservaOriginal.titular?.correo || "",
            codigoMunicipio: reservaOriginal.titular?.codigoMunicipio || "",
            nombreMunicipio: reservaOriginal.titular?.nombreMunicipio || "",
        }
    };

    /* *
     * Inicializamos el formulario y usamos 'as any' en el resolver.
     * Esto soluciona un bug técnico de TypeScript donde se atasca validando 
     * tipos muy complejos, pero la validación real de Zod seguirá funcionando perfecto.
     */
    const methods = useForm<TReserva>({
        resolver: zodResolver(esquemaReserva) as any,
        defaultValues: valoresIniciales
    });

    const onSubmit: SubmitHandler<TReserva> = (data) => {
        // Le pasamos los datos limpios y validados al componente padre (ReservationList)
        onGuardar(data);
    };

    return (
        <FormProvider {...methods}>
            <form 
                onSubmit={methods.handleSubmit(onSubmit)} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                className="formulario-modificar"
                aria-label="Formulario para modificar reserva"
            >
                {/* Pasamos el ID para que SeccionFechas ignore la ocupación de esta misma reserva 
                    y nos permita mantener nuestras propias fechas sin que salte el error de "días ocupados" */}
                <SeccionFechas reservaId={reservaOriginal.id} />
                
                <SeccionTitular isAdmin={isAdmin} userEmail={userEmail}/>
                
                <div className="acciones-modificar">
                    <button 
                        type="button" 
                        className="btn-cancelar"
                        onClick={onCancelar}
                        disabled={isPending}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="btn-guardar"
                        disabled={isPending}
                    >
                        {isPending ? 'Procesando...' : (reservaOriginal.status === 'approved' ? 'Solicitar Cambios' : 'Guardar Cambios')}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}