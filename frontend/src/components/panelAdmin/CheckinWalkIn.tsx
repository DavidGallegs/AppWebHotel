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
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                    <Users size={28} color="#3b82f6" />
                    <h2 className="admin-text-semibold" style={{ margin: 0 }}>Check-in Directo (Walk-in)</h2>
                </div>

                <div className="flex-column-gap" style={{ gap: '2rem' }}>
                    
                    {/* BLOQUE 1: Estancia */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 className="modal-section-title">1. Datos de la Estancia</h4>
                            {(methods.formState.errors.fechaEntrada || methods.formState.errors.fechaSalida) && (
                                <span className="admin-alert-waiting" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                                    <AlertTriangle size={14} /> Seleccione fechas
                                </span>
                            )}
                        </div>
                        <SeccionFechas />
                    </div>

                    {/* BLOQUE 2: Huéspedes */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 className="modal-section-title" style={{ margin: 0 }}>2. Huéspedes</h4>
                            <span className="admin-text-muted" style={{ fontWeight: 600 }}>
                                {fields.length} / 3 Viajeros
                            </span>
                        </div>
                        <p className="admin-text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                            Añade a los viajeros. El primero será el titular de la estancia. (Máximo 3 personas).
                        </p>
                        
                        {/* LÓGICA DE LÍMITE VISUAL */}
                        {fields.length < 3 ? (
                            <button 
                                type="button" 
                                className="btn-action btn-checkin"
                                onClick={() => append({ 
                                    rol: "VI", nombre: "", apellido1: "", apellido2: "", 
                                    tipoDocumento: "", numeroDocumento: "", soporteDocumento: "", 
                                    fechaNacimiento: "", parentesco: "", direccion: "", 
                                    codigoPostal: "", pais: "ESP", 
                                    codigoMunicipio: "", nombreMunicipio: ""
                                } as any)}
                                style={{ width: '100%', padding: '0.75rem', fontWeight: 600, border: 'none', justifyContent: 'center' }}
                            >
                                + Añadir Viajero
                            </button>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', background: '#fef3c7', padding: '0.75rem', borderRadius: '6px', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
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
                        <div style={{ marginTop: '1rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                            <button 
                                type="submit" 
                                disabled={mutations.crearWalkIn.isPending}
                                className="btn-action btn-approve"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
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