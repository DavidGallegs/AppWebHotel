import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // <-- EL PUENTE DE ZOD
import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

import { SeccionFechas } from "./SeccionFechas";
import { SeccionTitular } from "./SeccionTitular";
import { SeccionAcompanantes } from "./SeccionAcompanantes";

import "../../styles/formulario.css";

// <-- IMPORTAMOS EL ESQUEMA Y EL TIPO INFERIDO DESDE TU ARCHIVO ZOD
import { esquemaFormularioSes, type TFormularioSes } from "./esquemaZod"; 

countries.registerLocale(es);
const paisesObjeto = countries.getNames("es", { select: "official" });

export const listaPaises = Object.entries(paisesObjeto).map(([codigo2, nombre]) => ({
    codigo3: countries.alpha2ToAlpha3(codigo2),
    nombre,
}));

function Formulario() {
    // <-- CONECTAMOS ZOD AL FORMULARIO AQUÍ
    const methods = useForm<TFormularioSes>({
        resolver: zodResolver(esquemaFormularioSes),
        defaultValues: {
            acompanantes: []
        }
    });

    const { control, handleSubmit } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "acompanantes"
    });

    // Añadimos un console.log extra para ver los errores si la validación falla
    const enviar: SubmitHandler<TFormularioSes> = async (data) => {
        const numPersonas = 1 + data.acompanantes.length;
        const fechaActual = new Date();
        const fechaContrato = fechaActual.toISOString().split('T')[0];

        const payloadFinal = {
            ...data,
            numPersonas,
            fechaContrato
        };

        try {
            // Reemplaza el puerto (ej: 8000) por el que tengas expuesto en tu Docker
            const respuesta = await fetch("http://localhost:8000/api/tu-endpoint-de-laravel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json" // Importante para que Laravel devuelva errores en JSON
                },
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) {
                // Si Laravel devuelve un 422 (errores de validación) o un 500
                throw new Error(`Error del servidor: ${respuesta.status}`);
            }

            const resultado = await respuesta.json();
            console.log("¡Éxito! Laravel ha guardado esto:", resultado);
            alert("Formulario enviado correctamente.");

        } catch (error) {
            console.error("Fallo al conectar con el backend en Docker:", error);
            alert("Hubo un error al enviar los datos al servidor.");
        }
    };

    const erroresAlEnviar = (errores: any) => {
        console.error("Zod ha bloqueado el envío por estos errores:", errores);
    };

    return (
        <div className="container-form">
            <FormProvider {...methods}>
                {/* Si hay errores, ejecuta erroresAlEnviar en lugar de enviar */}
                <form className="form" onSubmit={handleSubmit(enviar, erroresAlEnviar)}>
                    
                    <SeccionFechas />
                    <SeccionTitular />

                    {fields.map((field, index) => (
                        <SeccionAcompanantes 
                            key={field.id} 
                            index={index} 
                            remover={() => remove(index)} 
                        />
                    ))}

                    <div className="acciones-formulario">
                        <button 
                            type="button" 
                            onClick={() => append({ 
                                rol: "VI",
                                nombre: "", apellido1: "", apellido2: "", tipoDocumento: "", 
                                numeroDocumento: "", soporteDocumento: "", fechaNacimiento: "", 
                                parentesco: "", direccion: "", codigoPostal: "", pais: "" 
                            })}
                        >
                            + Añadir Acompañante
                        </button>

                        <button type="submit">Enviar Formulario</button>
                    </div>

                </form>
            </FormProvider>
        </div>
    );
}

export default Formulario;