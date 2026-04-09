import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "./Formulario"; 
import { type TFormularioSes } from "./esquemaZod";

const municipiosPrueba = [
    { codigo: "01051", nombre: "Agurain/Salvatierra" },
    { codigo: "28079", nombre: "Madrid" },
    { codigo: "08019", nombre: "Barcelona" },
    { codigo: "41091", nombre: "Sevilla" },
    { codigo: "46250", nombre: "Valencia" }
];

export function SeccionTitular() {
    // 1. Extraemos register y también control para poder usar useWatch
    const { register, control } = useFormContext<TFormularioSes>();

    // 2. Escuchamos el país seleccionado en tiempo real
    const paisSeleccionado = useWatch({
        control,
        name: "titular.pais",
    });

    return (
        <fieldset className="seccion-titular">
            <legend>Datos del Titular</legend>

            <input type="hidden" value="TI" {...register("titular.rol")} />
            <input type="text" placeholder="Nombre" {...register("titular.nombre")} />
            <input type="text" placeholder="Primer Apellido" {...register("titular.apellido1")} />
            <input type="text" placeholder="Segundo Apellido" {...register("titular.apellido2")} />
            
            <select {...register("titular.tipoDocumento")}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIF">NIF</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" {...register("titular.numeroDocumento")} />
            <input type="text" placeholder="Soporte Documento" {...register("titular.soporteDocumento")} />
            
            <input type="date" {...register("titular.fechaNacimiento")} />
            
            <input type="tel" placeholder="Teléfono" {...register("titular.telefono")} />
            <input type="email" placeholder="Correo" {...register("titular.correo")} />
            
            <input type="text" placeholder="Dirección" {...register("titular.direccion")} />
            <input type="text" placeholder="Código Postal" {...register("titular.codigoPostal")} />
            
            <select {...register("titular.pais")}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>
                        {pais.nombre}
                    </option>
                ))}
            </select>

            {/* 3. Renderizado condicional de los Municipios */}
            {paisSeleccionado === "ESP" ? (
                <select {...register("titular.codigoMunicipio")}>
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
                    {...register("titular.nombreMunicipio")} 
                />
            )}
        </fieldset>
    );
}