import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { type TParteViajeros } from "./esquemaViajeros";
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio"; 
import opciones_parentesco from '../utils/parentescos.json';

interface PropsViajero {
    index: number;
    remover: () => void;
}

export function SeccionViajero({ index, remover }: PropsViajero) {
    const { register, control } = useFormContext<TParteViajeros>();
    const paisSeleccionado = useWatch({ control, name: `viajeros.${index}.pais` as const });

    return (
        <fieldset className="seccion-acompanante">
            <legend>Datos del Viajero #{index + 1}</legend>
            <button type="button" onClick={remover} style={{ float: 'right' }}>X Eliminar</button>
            
            <input type="hidden" value="VI" {...register(`viajeros.${index}.rol` as const)} />
            <input type="text" placeholder="Nombre" {...register(`viajeros.${index}.nombre` as const)} />
            <input type="text" placeholder="Primer Apellido" {...register(`viajeros.${index}.apellido1` as const)} />
            <input type="text" placeholder="Segundo Apellido" {...register(`viajeros.${index}.apellido2` as const)} />
            
            <select {...register(`viajeros.${index}.tipoDocumento` as const)}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" {...register(`viajeros.${index}.numeroDocumento` as const)} />
            <input type="text" placeholder="Soporte Documento" {...register(`viajeros.${index}.soporteDocumento` as const)} />
            <input type="date" {...register(`viajeros.${index}.fechaNacimiento` as const)} />
            
            <select {...register(`viajeros.${index}.parentesco` as const)} defaultValue="">
                <option value="">Selecciona un parentesco</option>
                {opciones_parentesco.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                ))}
            </select>
            
            <input type="text" placeholder="Dirección" {...register(`viajeros.${index}.direccion` as const)} />
            <input type="text" placeholder="Código Postal" {...register(`viajeros.${index}.codigoPostal` as const)} />
            
            <select {...register(`viajeros.${index}.pais` as const)}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>{pais.nombre}</option>
                ))}
            </select>

            {paisSeleccionado === "ESP" ? (
                <BuscadorMunicipio name={`viajeros.${index}.codigoMunicipio`} />
            ) : (
                <input type="text" placeholder="Nombre de Ciudad" {...register(`viajeros.${index}.nombreMunicipio` as const)} />
            )}
        </fieldset>
    );
}