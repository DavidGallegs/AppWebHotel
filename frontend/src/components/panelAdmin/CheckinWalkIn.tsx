import { useState } from 'react';
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { esquemaParteViajeros, type TParteViajeros } from "../formularios/parteViajeros/esquemaViajeros"; 

// 2. Ajustamos la ruta para el componente del viajero
import { SeccionViajero } from "../formularios/parteViajeros/SeccionViajero";

// 3. Ajustamos la ruta para el calendario de fechas
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas"; 

import { api } from "../dashboard/api";
import { Users, Save, Loader2 } from "lucide-react";

export default function CheckinWalkIn() {
    const [enviando, setEnviando] = useState(false);

    const methods = useForm<any>({
        resolver: zodResolver(esquemaParteViajeros),
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

    const onSubmit = async (data: any) => {
        setEnviando(true);
        try {
            const payload = {
                habitacion_id: data.habitacion,
                fecha_entrada: data.fechaEntrada,
                fecha_salida: data.fechaSalida,
                viajeros: data.viajeros.map((v: any) => {
                    const viajero = { ...v };
                    if (viajero.pais === "ESP") delete viajero.nombreMunicipio;
                    else delete viajero.codigoMunicipio;
                    return viajero;
                })
            };

            await api.post('/admin/walk-in', payload);
            alert("Check-in directo completado con éxito. Reserva creada y finalizada.");
            methods.reset();
        } catch (error) {
            console.error(error);
            alert("Error al procesar el check-in directo.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="admin-card fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                    <Users size={28} color="#3b82f6" />
                    <h2 style={{ margin: 0 }}>Check-in Directo (Walk-in)</h2>
                </div>

                {/* CAMBIO DE DISEÑO: 'flex-col' para que se pongan en torre */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
                    
                    {/* BLOQUE 1: Estancia */}
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>1. Estancia</h4>
                        <SeccionFechas />
                    </div>

                    {/* BLOQUE 2: Huéspedes */}
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#111827' }}>2. Huéspedes</h4>
                        <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Añade a los viajeros. El primero será el titular de la reserva.
                        </p>
                        <button 
                            type="button" 
                            className="btn-action btn-checkin"
                            onClick={() => append({ rol: "VI", nombre: "" })}
                            style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
                        >
                            + Añadir Viajero
                        </button>
                    </div>
                </div>

                {/* LISTA DE FORMULARIOS DE VIAJEROS */}
                <div className="viajeros-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {fields.map((field, index) => (
                        <SeccionViajero 
                            key={field.id} 
                            index={index} 
                            remover={() => remove(index)} 
                        />
                    ))}
                </div>

                {fields.length > 0 && (
                    <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                        <button 
                            type="submit" 
                            disabled={enviando}
                            className="btn-action btn-approve"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                        >
                            {enviando ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Finalizar Registro y Crear Reserva
                        </button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
}