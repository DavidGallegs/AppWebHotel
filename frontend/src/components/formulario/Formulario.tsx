import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

import { SeccionFechas } from "./SeccionFechas";
import { SeccionTitular } from "./SeccionTitular";
import { SeccionAcompanantes } from "./SeccionAcompanantes";
import "../../styles/formulario.css";

import { esquemaFormularioSes, type TFormularioSes } from "./esquemaZod"; 

countries.registerLocale(es);
const paisesObjeto = countries.getNames("es", { select: "official" });

// 1. Primero sacamos la lista cruda normal
const listaCruda = Object.entries(paisesObjeto).map(([codigo2, nombre]) => ({
    codigo3: countries.alpha2ToAlpha3(codigo2) || "",
    nombre,
}));

// 2. Construimos la lista final poniendo España primero, y ordenando el resto de la A a la Z
export const listaPaises = [
    ...listaCruda.filter(pais => pais.codigo3 === "ESP"),
    ...listaCruda
        .filter(pais => pais.codigo3 !== "ESP")
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
];

function Formulario() {
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

    const enviar: SubmitHandler<TFormularioSes> = async (data) => {
        // --- LIMPIEZA DE DATOS ---
        // Evitamos enviar `nombreMunicipio` si es ESP, o `codigoMunicipio` si NO es ESP
        // por si el usuario cambió de país a mitad del formulario.
        const payloadLimpio = structuredClone(data);

        // Limpiar titular
        if (payloadLimpio.titular.pais === "ESP") {
            delete payloadLimpio.titular.nombreMunicipio;
        } else {
            delete payloadLimpio.titular.codigoMunicipio;
        }

        // Limpiar acompañantes
        if (payloadLimpio.acompanantes && payloadLimpio.acompanantes.length > 0) {
            payloadLimpio.acompanantes = payloadLimpio.acompanantes.map(acomp => {
                if (acomp.pais === "ESP") {
                    delete acomp.nombreMunicipio;
                } else {
                    delete acomp.codigoMunicipio;
                }
                return acomp;
            });
        }
        // -------------------------

        const numPersonas = 1 + payloadLimpio.acompanantes.length;
        const fechaActual = new Date();
        const fechaContrato = fechaActual.toISOString().split('T')[0];

        const payloadFinal = {
            ...payloadLimpio,
            numPersonas,
            fechaContrato
        };

        try {
            const respuesta = await fetch("http://localhost:8000/api/reservas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payloadFinal)
            });

            if (!respuesta.ok) {
                const errorDetallado = await respuesta.json();
                console.error("Detalle del error 500:", errorDetallado);
                throw new Error(`Error: ${respuesta.status}`);
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