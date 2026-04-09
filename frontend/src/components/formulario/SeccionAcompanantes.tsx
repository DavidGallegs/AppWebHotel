import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "./Formulario"; 
import { type TFormularioSes } from "./esquemaZod";

interface PropsAcompanante {
    index: number;
    remover: () => void;
}

// ARRAY DE PRUEBA (Mismo que en el Titular)
const municipiosPrueba = [
    { codigo: "01051", nombre: "Agurain/Salvatierra" },
    { codigo: "28079", nombre: "Madrid" },
    { codigo: "08019", nombre: "Barcelona" },
    { codigo: "41091", nombre: "Sevilla" },
    { codigo: "46250", nombre: "Valencia" }
];

export function SeccionAcompanantes({ index, remover }: PropsAcompanante) {
    // 1. Extraemos control además de register
    const { register, control } = useFormContext<TFormularioSes>();

    // 2. Escuchamos el país específico de ESTE acompañante
    const paisSeleccionado = useWatch({
        control,
        name: `acompanantes.${index}.pais` as const,
    });

    return (
        <fieldset className="seccion-acompanante">
            <legend>Datos del Acompañante</legend>
            <button type="button" onClick={remover} style={{ float: 'right' }}>X Eliminar</button>
            
            <input type="hidden" value="VI" {...register(`acompanantes.${index}.rol` as const)} />
            
            <input type="text" placeholder="Nombre" {...register(`acompanantes.${index}.nombre` as const)} />
            <input type="text" placeholder="Primer Apellido" {...register(`acompanantes.${index}.apellido1` as const)} />
            <input type="text" placeholder="Segundo Apellido" {...register(`acompanantes.${index}.apellido2` as const)} />
            
            <select {...register(`acompanantes.${index}.tipoDocumento` as const)}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" {...register(`acompanantes.${index}.numeroDocumento` as const)} />
            <input type="text" placeholder="Soporte Documento" {...register(`acompanantes.${index}.soporteDocumento` as const)} />
            
            <input type="date" {...register(`acompanantes.${index}.fechaNacimiento` as const)} />
            <input type="text" placeholder="Parentesco" {...register(`acompanantes.${index}.parentesco` as const)} />
            
            <input type="text" placeholder="Dirección" {...register(`acompanantes.${index}.direccion` as const)} />
            <input type="text" placeholder="Código Postal" {...register(`acompanantes.${index}.codigoPostal` as const)} />
            
            <select {...register(`acompanantes.${index}.pais` as const)}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>
                        {pais.nombre}
                    </option>
                ))}
            </select>

            {/* RENDERIZADO CONDICIONAL DE MUNICIPIOS PARA EL ACOMPAÑANTE */}
            {paisSeleccionado === "ESP" ? (
                <select {...register(`acompanantes.${index}.codigoMunicipio` as const)}>
                    <option value="">Selecciona Municipio de prueba...</option>
                    {municipiosPrueba.map((mun) => (
                        <option key={mun.codigo} value={mun.codigo}>
                            {mun.nombre} ({mun.codigo})
                        </option>
                    ))}
                </select>
            ) : (
                <input 
                    type="text" 
                    placeholder="Nombre de Ciudad / Municipio" 
                    {...register(`acompanantes.${index}.nombreMunicipio` as const)} 
                />
            )}
        </fieldset>
    );
}