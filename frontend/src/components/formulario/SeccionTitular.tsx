import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "./Formulario"; 
import { type TFormularioSes } from "./esquemaZod";

// Asegúrate de poner la ruta correcta a tu nuevo archivo JSON
import datasetMunicipios from "./municipios.json"; 

export function SeccionTitular() {
    const { register, control } = useFormContext<TFormularioSes>();

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

            {/* Renderizado condicional basado en el país (Usando municipio_id) */}
            {paisSeleccionado === "ESP" ? (
                <select {...register("titular.codigoMunicipio")}>
                    <option value="">Selecciona Municipio...</option>
                    {datasetMunicipios.map((mun: any) => (
                        <option key={mun.municipio_id} value={mun.municipio_id}>
                            {mun.nombre}
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