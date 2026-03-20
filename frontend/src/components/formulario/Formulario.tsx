import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

import { SeccionTitular } from "./SeccionTitular";
import { SeccionAcompanantes } from "./SeccionAcompanantes";
import { SeccionFechas } from "./SeccionFechas"; // <-- Nueva importación

// --- CONFIGURACIÓN DE PAÍSES (Exportado para los hijos) ---
countries.registerLocale(es);
const paisesObjeto = countries.getNames("es", { select: "official" });

export const listaPaises = Object.entries(paisesObjeto).map(([codigo2, nombre]) => ({
    codigo3: countries.alpha2ToAlpha3(codigo2),
    nombre,
}));

// --- INTERFACES (Exportadas para los hijos) ---
export interface ITitular {
    rol: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    tipoDocumento: string;
    numeroDocumento: string;
    soporteDocumento: string;
    fechaNacimiento: string;
    telefono: string;
    correo: string;
    direccion: string;
    codigoPostal: string;
    pais: string;
}

export interface IAcompanante {
    rol: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    tipoDocumento: string;
    numeroDocumento: string;
    fechaNacimiento: string;
    parentesco: string;
    direccion: string;
    codigoPostal: string;
    pais: string;
}

export interface IFormularioSes {
    fechaEntrada: string;
    fechaSalida: string;
    titular: ITitular;
    acompanantes: IAcompanante[];
}

// --- COMPONENTE PRINCIPAL ---
function Formulario() {
    const methods = useForm<IFormularioSes>({
        defaultValues: {
            acompanantes: []
        }
    });

    const { control, handleSubmit } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "acompanantes"
    });

    const enviar: SubmitHandler<IFormularioSes> = (data) => {
        const numPersonas = 1 + data.acompanantes.length;

        const fechaActual = new Date();
        const fechaContrato = fechaActual.toISOString().split('T')[0]; 

        //Juntamos todo en un único objeto final
        const loadFinal = {
            ...data,           // Mete todos los datos del titular, acompañantes y fechas de reserva
            numPersonas,       // contador
            fechaContrato      // Añade la fecha de envío
        };

        console.log("Paquete final generado por el formulario:", loadFinal);
        
        // Aqui va el fetch a la API
    };

    return (
        <div className="container-form">
            <FormProvider {...methods}>
                <form className="form" onSubmit={handleSubmit(enviar)}>

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
                                rol:"VI", nombre: "", apellido1: "", apellido2: "", tipoDocumento: "", 
                                numeroDocumento: "", fechaNacimiento: "", parentesco: "", 
                                direccion: "", codigoPostal: "", pais: "" 
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