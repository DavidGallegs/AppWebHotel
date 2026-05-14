import { useState } from 'react';
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { esquemaParteViajeros, type TParteViajeros } from "../formularios/parteViajeros/esquemaViajeros"; 
import { SeccionViajero } from "../formularios/parteViajeros/SeccionViajero";
import { SeccionFechas } from "../formularios/reservaHotel/SeccionFechas"; 

import { api } from "../dashboard/api";
import { Users, Save, Loader2, AlertTriangle } from "lucide-react";

export default function CheckinWalkIn() {
    const [enviando, setEnviando] = useState(false);

    const methods = useForm<any>({
        // Mantenemos el resolver de viajeros, pero permitimos campos extra como fechas
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
        // DEPUREMOS: Mira la consola (F12) al dar al botón para ver qué nombres de campos llegan
        console.log("Datos del formulario recibidos:", data);

        // Buscamos los valores por si acaso SeccionFechas usa guiones bajos o camelCase
        const h_id = data.habitacion || data.habitacion_id || "1";
        const f_in = data.fechaEntrada || data.fecha_entrada;
        const f_out = data.fechaSalida || data.fecha_salida;

        if (!f_in || !f_out) {
            alert("⚠️ Error: No se han capturado las fechas. Asegúrate de seleccionarlas en el calendario del Bloque 1.");
            return;
        }

        setEnviando(true);
        try {
            // Mapeamos exactamente a lo que el backend de Laravel espera recibir
            const payload = {
                habitacion_id: h_id,
                fecha_entrada: f_in,
                fecha_salida: f_out,
                numPersonas: data.viajeros.length,
                viajeros: data.viajeros.map((v: any) => {
                    const viajero = { ...v };
                    if (viajero.pais === "ESP") delete viajero.nombreMunicipio;
                    else delete viajero.codigoMunicipio;
                    return viajero;
                })
            };

            await api.post('/admin/walk-in', payload);
            alert("✅ Check-in directo realizado con éxito. Reserva creada y finalizada.");
            methods.reset();
        } catch (error) {
            console.error("Error en la petición Walk-in:", error);
            alert("Error en el servidor. Revisa que el backend acepte 'habitacion_id', 'fecha_entrada' y 'fecha_salida'.");
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* BLOQUE 1: Estancia - Aquí se eligen fechas y habitación */}
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: 0, color: '#111827' }}>1. Datos de la Estancia</h4>
                            {!methods.watch("fechaEntrada") && (
                                <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={14} /> Fechas requeridas
                                </span>
                            )}
                        </div>
                        <SeccionFechas />
                    </div>

                    {/* BLOQUE 2: Huéspedes */}
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#111827' }}>2. Huéspedes</h4>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Añade a los viajeros presentes. El primero será el titular.
                        </p>
                        <button 
                            type="button" 
                            className="btn-action btn-checkin"
                            onClick={() => append({ rol: "VI", nombre: "", pais: "ESP" })}
                            style={{ width: '100%', padding: '0.75rem', fontWeight: 600, border: 'none' }}
                        >
                            + Añadir Viajero
                        </button>
                    </div>

                    {/* LISTA DINÁMICA DE VIAJEROS */}
                    <div className="viajeros-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {fields.map((field, index) => (
                            <SeccionViajero 
                                key={field.id} 
                                index={index} 
                                remover={() => remove(index)} 
                            />
                        ))}
                    </div>

                    {/* BOTÓN FINAL */}
                    {fields.length > 0 && (
                        <div style={{ marginTop: '1rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                            <button 
                                type="submit" 
                                disabled={enviando}
                                className="btn-action btn-approve"
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    fontSize: '1.1rem', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    cursor: enviando ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {enviando ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {enviando ? 'Procesando...' : 'Finalizar Check-in y Crear Reserva'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}