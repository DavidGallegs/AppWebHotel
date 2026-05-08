import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas";
import { SeccionTitular } from "../formularios/reservaHotel/SeccionTitular";
import { esquemaReserva, type TReserva } from "../formularios/reservaHotel/esquemaReserva"; 
import type { FullReservation } from "./ReservationList"; 

interface Props {
    reservaOriginal: FullReservation;
    onGuardar: (data: TReserva) => void;
    onCancelar: () => void;
    isPending: boolean;
}

export function FormularioModificar({ reservaOriginal, onGuardar, onCancelar, isPending }: Props) {
    
    /**
     * Construimos el objeto inicial asegurándonos de que todas las propiedades
     * requeridas por el esquema TReserva tengan un valor (aunque sea vacío).
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

    /**
     * CORRECCIÓN CLAVE: 
     * 1. Usamos el genérico <TReserva> para que el formulario sepa exactamente qué datos maneja.
     * 2. Aplicamos 'as any' al resolver para romper el bucle de validación de tipos complejos 
     * que está causando el error del "undefined" en habitación.
     */
    const methods = useForm<TReserva>({
        resolver: zodResolver(esquemaReserva) as any,
        defaultValues: valoresIniciales
    });

    /**
     * CORRECCIÓN DEL ENVIAR:
     * Al usar methods.handleSubmit, pasamos una función que recibe 'data' ya validado como TReserva.
     */
    const onSubmit: SubmitHandler<TReserva> = (data) => {
        onGuardar(data);
    };

    return (
        <FormProvider {...methods}>
            <form 
                onSubmit={methods.handleSubmit(onSubmit)} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
                {/* Pasamos el ID para que SeccionFechas ignore la ocupación de esta misma reserva */}
                <SeccionFechas reservaId={reservaOriginal.id} />
                
                <SeccionTitular />
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '1rem', 
                    marginTop: '1rem', 
                    borderTop: '1px solid #eee', 
                    paddingTop: '1rem' 
                }}>
                    <button 
                        type="button" 
                        onClick={onCancelar}
                        disabled={isPending}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            background: 'white', 
                            border: '1px solid #ccc', 
                            borderRadius: '6px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={isPending}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            background: '#1d4ed8', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {isPending ? 'Procesando...' : (reservaOriginal.status === 'approved' ? 'Solicitar Cambios' : 'Guardar Cambios')}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}