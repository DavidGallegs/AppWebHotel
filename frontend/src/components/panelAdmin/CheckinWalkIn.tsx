import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Save, Loader2, AlertTriangle, Info } from "lucide-react";

import { esquemaWalkIn, type TWalkIn } from "./esquemaWalkIn"; 
import { SeccionViajero } from "../formularios/parteViajeros/SeccionViajero";
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas"; 
import { useAdmin } from "./useAdmin";

/* * COMPONENTE: CheckinWalkIn
 * Propósito: Un formulario masivo que une la creación de la reserva y 
 * la toma de datos de los viajeros en un solo paso, ideal para la recepción.
 */
export default function CheckinWalkIn() {
    const { mutations } = useAdmin();

    const methods = useForm<TWalkIn>({
        resolver: zodResolver(esquemaWalkIn),
        defaultValues: { habitacion: "1", fechaEntrada: "", fechaSalida: "", viajeros: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "viajeros"
    });

    const onSubmit = (data: TWalkIn) => {
        const payload = {
            idHabitacion: data.habitacion, 
            fecha_entrada: data.fechaEntrada,
            fecha_salida: data.fechaSalida,
            numPersonas: data.viajeros.length,
            viajeros: data.viajeros.map((v) => {
                const viajero = { ...v };
                if (viajero.pais === "ESP") delete (viajero as any).nombreMunicipio;
                else delete (viajero as any).codigoMunicipio;
                return viajero;
            })
        };

        mutations.crearWalkIn.mutate(payload, { onSuccess: () => methods.reset() });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="fade-in" aria-label="Formulario de Check-in Directo">
                
                <header className="admin-page-title">
                    <Users size={28} color="#3b82f6" aria-hidden="true" />
                    <h2>Check-in Directo (Walk-in)</h2>
                </header>

                <div className="form-blocks-container">
                    
                    <section className="admin-card" aria-labelledby="titulo-estancia">
                        <div className="section-header">
                            <h4 id="titulo-estancia" className="modal-section-title">1. Datos de la Estancia</h4>
                            {(methods.formState.errors.fechaEntrada || methods.formState.errors.fechaSalida) && (
                                <span className="alert-text-error" role="alert">
                                    <AlertTriangle size={14} aria-hidden="true" /> Seleccione fechas válidas
                                </span>
                            )}
                        </div>
                        <SeccionFechas />
                    </section>

                    <section className="admin-card" aria-labelledby="titulo-huespedes">
                        <div className="section-header-sm">
                            <h4 id="titulo-huespedes" className="modal-section-title">2. Huéspedes</h4>
                            <span className="admin-text-semibold" aria-live="polite">
                                {fields.length} / 3 Viajeros
                            </span>
                        </div>
                        <p className="admin-text-muted mb-4">
                            Registre a los viajeros presentes. El primero de la lista será el titular de la estancia.
                        </p>
                        
                        {fields.length < 3 ? (
                            <button 
                                type="button" 
                                className="btn-action btn-checkin btn-full"
                                aria-label="Añadir formulario para un nuevo viajero"
                                onClick={() => append({ 
                                    rol: "VI", nombre: "", apellido1: "", apellido2: "", 
                                    tipoDocumento: "", numeroDocumento: "", soporteDocumento: "", 
                                    fechaNacimiento: "", parentesco: "", direccion: "", 
                                    codigoPostal: "", pais: "ESP", codigoMunicipio: "", nombreMunicipio: ""
                                } as any)}
                            >
                                + Añadir Viajero
                            </button>
                        ) : (
                            <div className="alert-box alert-warning" role="status">
                                <Info size={16} aria-hidden="true" /> Capacidad máxima de la habitación alcanzada.
                            </div>
                        )}
                    </section>

                    {/* Contenedor dinámico para los viajeros */}
                    <div className="flex-column-gap">
                        {fields.map((field, index) => (
                            <SeccionViajero key={field.id} index={index} remover={() => remove(index)} />
                        ))}
                    </div>

                    {fields.length > 0 && (
                        <div className="form-footer">
                            <button 
                                type="submit" 
                                disabled={mutations.crearWalkIn.isPending}
                                className="btn-action btn-approve btn-large"
                                aria-busy={mutations.crearWalkIn.isPending}
                            >
                                {mutations.crearWalkIn.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save size={20} aria-hidden="true" />}
                                {mutations.crearWalkIn.isPending ? 'Procesando envío...' : 'Finalizar y Crear Reserva'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}