import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Save, Loader2, AlertTriangle, Info } from "lucide-react";

import { esquemaWalkIn, type TWalkIn } from "./esquemaWalkIn"; 
import { SeccionViajero } from "../formularios/parteViajeros/SeccionViajero";
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas"; 
import { useAdmin } from "./useAdmin";

export default function CheckinWalkIn() {
    const { mutations } = useAdmin();

    const methods = useForm<TWalkIn>({
        resolver: zodResolver(esquemaWalkIn),
        defaultValues: {
            habitacion: "1",
            fechaEntrada: "",
            fechaSalida: "",
            viajeros: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "viajeros"
    });

    const onSubmit = (data: TWalkIn) => {
        const payload = {
            habitacion_id: data.habitacion,
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

        mutations.crearWalkIn.mutate(payload, {
            onSuccess: () => methods.reset()
        });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="fade-in">
                
                <div className="admin-page-title">
                    <Users size={28} color="#3b82f6" />
                    <h2>Check-in Directo (Walk-in)</h2>
                </div>

                <div className="form-blocks-container">
                    
                    {/* BLOQUE 1: Estancia */}
                    <div className="admin-card">
                        <div className="section-header">
                            <h4 className="modal-section-title">1. Datos de la Estancia</h4>
                            {(methods.formState.errors.fechaEntrada || methods.formState.errors.fechaSalida) && (
                                <span className="alert-text-error">
                                    <AlertTriangle size={14} /> Seleccione fechas
                                </span>
                            )}
                        </div>
                        <SeccionFechas />
                    </div>

                    {/* BLOQUE 2: Huéspedes */}
                    <div className="admin-card">
                        <div className="section-header-sm">
                            <h4 className="modal-section-title">2. Huéspedes</h4>
                            <span className="admin-text-semibold">
                                {fields.length} / 3 Viajeros
                            </span>
                        </div>
                        <p className="admin-text-muted mb-4">
                            Añade a los viajeros. El primero será el titular de la estancia. (Máximo 3 personas).
                        </p>
                        
                        {fields.length < 3 ? (
                            <button 
                                type="button" 
                                className="btn-action btn-checkin btn-full"
                                onClick={() => append({ 
                                    rol: "VI", nombre: "", apellido1: "", apellido2: "", 
                                    tipoDocumento: "", numeroDocumento: "", soporteDocumento: "", 
                                    fechaNacimiento: "", parentesco: "", direccion: "", 
                                    codigoPostal: "", pais: "ESP", 
                                    codigoMunicipio: "", nombreMunicipio: ""
                                } as any)}
                            >
                                + Añadir Viajero
                            </button>
                        ) : (
                            <div className="alert-box alert-warning">
                                <Info size={16} /> Capacidad máxima de la habitación alcanzada.
                            </div>
                        )}
                    </div>

                    {/* LISTA DINÁMICA */}
                    <div className="flex-column-gap">
                        {fields.map((field, index) => (
                            <SeccionViajero key={field.id} index={index} remover={() => remove(index)} />
                        ))}
                    </div>

                    {/* ENVÍO */}
                    {fields.length > 0 && (
                        <div className="form-footer">
                            <button 
                                type="submit" 
                                disabled={mutations.crearWalkIn.isPending}
                                className="btn-action btn-approve btn-large"
                            >
                                {mutations.crearWalkIn.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {mutations.crearWalkIn.isPending ? 'Procesando...' : 'Finalizar y Crear Reserva'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}