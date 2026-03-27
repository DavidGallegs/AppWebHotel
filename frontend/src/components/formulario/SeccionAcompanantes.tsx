import { useFormContext } from "react-hook-form";
import { listaPaises } from "./Formulario"; // Solo importamos la lista de aquí
import { type TFormularioSes } from "./esquemaZod";

interface PropsAcompanante {
    index: number;
    remover: () => void;
}

export function SeccionAcompanantes({ index, remover }: PropsAcompanante) {
    const { register } = useFormContext<TFormularioSes>();

    return (
        <fieldset className="seccion-acompanante">
            <legend>Acompañante {index + 1}</legend>
            
            <button type="button" onClick={remover}>X Eliminar</button>

            <input type="hidden" value="VI" {...register(`acompanantes.${index}.rol` as const)}/>

            <input type="text" placeholder="Nombre" {...register(`acompanantes.${index}.nombre` as const)} />
            <input type="text" placeholder="Primer Apellido" {...register(`acompanantes.${index}.apellido1` as const)} />
            <input type="text" placeholder="Segundo Apellido" {...register(`acompanantes.${index}.apellido2` as const)} />
            
            <select {...register(`acompanantes.${index}.tipoDocumento` as const)}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PAS">Pasaporte</option>
                <option value="OTRO">Otro</option>
            </select>
            
            <input type="text" placeholder="Número Documento" {...register(`acompanantes.${index}.numeroDocumento` as const)} />
            <input type="text" placeholder="Soporte Documento" {...register(`acompanantes.${index}.soporteDocumento` as const)} />
            <input type="date" {...register(`acompanantes.${index}.fechaNacimiento` as const)} />
            
            <select {...register(`acompanantes.${index}.parentesco` as const)}>
                <option value="">Parentesco...</option>
                <option value="HJ">Hijo/a</option>
                <option value="HR">Hermano/a</option>
                <option value="NI">Nieto/a</option>
                <option value="SB">Sobrino/a</option>
                <option value="CD">Cuñado/a</option>
                <option value="OT">Otro</option>
            </select>

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
        </fieldset>
    );
}