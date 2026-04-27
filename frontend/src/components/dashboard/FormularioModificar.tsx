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
    
    // Le asignamos el tipo 'any' temporalmente al objeto inicial para evitar el choque 
    // de inferencia profunda entre los opcionales de Zod y los tipos de React Hook Form.
    const valoresIniciales: any = {
        habitacion: reservaOriginal.habitacion || "1",
        fechaEntrada: reservaOriginal.fechaEntrada,
        fechaSalida: reservaOriginal.fechaSalida,
        numPersonas: reservaOriginal.numPersonas || 1,
        titular: {
            rol: "TI",
            nombre: reservaOriginal.titular?.nombre || reservaOriginal.nombre || "",
            apellido1: reservaOriginal.titular?.apellido1 || reservaOriginal.apellido1 || "",
            apellido2: reservaOriginal.titular?.apellido2 || "",
            tipoDocumento: reservaOriginal.titular?.tipoDocumento || "",
            numeroDocumento: reservaOriginal.titular?.numeroDocumento || "",
            fechaNacimiento: "", 
            telefono: reservaOriginal.titular?.telefono || "",
            correo: reservaOriginal.titular?.correo || "",
            direccion: reservaOriginal.titular?.direccion || "",
            codigoPostal: reservaOriginal.titular?.codigoPostal || "",
            pais: reservaOriginal.titular?.pais || "",
            codigoMunicipio: reservaOriginal.titular?.codigoMunicipio || "",
            nombreMunicipio: reservaOriginal.titular?.nombreMunicipio || ""
        }
    };

    // Dejamos que useForm infiera los tipos directamente del resolver de Zod
    const methods = useForm({
        resolver: zodResolver(esquemaReserva),
        defaultValues: valoresIniciales
    });

    // Recibimos la data validada y le confirmamos a TypeScript que cumple con TReserva
    const enviar = (data: any) => {
        onGuardar(data as TReserva);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(enviar)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <SeccionFechas />
                <SeccionTitular />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button 
                        type="button" 
                        onClick={onCancelar}
                        disabled={isPending}
                        style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={isPending}
                        style={{ padding: '0.5rem 1rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}