import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio"; 
import opciones_parentesco from '../utils/parentescos.json';

interface PropsViajero {
    index: number;
    remover: () => void;
}

/* * COMPONENTE: SeccionViajero
 * Propósito: Renderiza los campos individuales de un único viajero. 
 * Se conecta al contexto del formulario padre usando el 'index' para saber su posición.
 */
export function SeccionViajero({ index, remover }: PropsViajero) {
    const { register, control } = useFormContext<any>();
    
    // Observamos en tiempo real qué país se selecciona para cambiar el input de municipio
    const paisSeleccionado = useWatch({ control, name: `viajeros.${index}.pais` });

    return (
        // ACCESIBILIDAD: El fieldset agrupa lógicamente los datos de esta persona
        <fieldset className="seccion-acompanante" aria-labelledby={`legend-viajero-${index}`}>
            <legend id={`legend-viajero-${index}`}>Datos del Viajero #{index + 1}</legend>
            
            <button 
                type="button" 
                onClick={remover} 
                style={{ float: 'right' }} 
                className="btn-action btn-danger-soft"
                aria-label={`Eliminar viajero número ${index + 1}`}
            >
                X Eliminar
            </button>
            
            <input type="hidden" value="VI" {...register(`viajeros.${index}.rol`)} />
            
            {/* Inputs personales */}
            <input type="text" placeholder="Nombre" aria-label="Nombre del viajero" {...register(`viajeros.${index}.nombre`)} />
            <input type="text" placeholder="Primer Apellido" aria-label="Primer Apellido" {...register(`viajeros.${index}.apellido1`)} />
            <input type="text" placeholder="Segundo Apellido" aria-label="Segundo Apellido" {...register(`viajeros.${index}.apellido2`)} />
            
            {/* Documentación */}
            <select aria-label="Tipo de documento de identidad" {...register(`viajeros.${index}.tipoDocumento`)}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" aria-label="Número de Documento" {...register(`viajeros.${index}.numeroDocumento`)} />
            <input type="text" placeholder="Soporte Documento" aria-label="Soporte de Documento" {...register(`viajeros.${index}.soporteDocumento`)} />
            
            {/* Accesibilidad: Indicamos claramente que es fecha de nacimiento */}
            <input type="date" aria-label="Fecha de nacimiento" {...register(`viajeros.${index}.fechaNacimiento`)} />
            
            <select aria-label="Parentesco con el titular" {...register(`viajeros.${index}.parentesco`)} defaultValue="">
                <option value="">Selecciona un parentesco</option>
                {opciones_parentesco.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                ))}
            </select>
            
            {/* Dirección */}
            <input type="text" placeholder="Dirección" aria-label="Dirección de residencia" {...register(`viajeros.${index}.direccion`)} />
            <input type="text" placeholder="Código Postal" aria-label="Código Postal" {...register(`viajeros.${index}.codigoPostal`)} />
            
            <select aria-label="País de residencia" {...register(`viajeros.${index}.pais`)}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>{pais.nombre}</option>
                ))}
            </select>

            {/* Lógica condicional: Buscador en España, texto libre en Extranjero */}
            {paisSeleccionado === "ESP" ? (
                <BuscadorMunicipio name={`viajeros.${index}.codigoMunicipio`} />
            ) : (
                <input type="text" placeholder="Nombre de Ciudad" aria-label="Nombre de la ciudad extranjera" {...register(`viajeros.${index}.nombreMunicipio`)} />
            )}
        </fieldset>
    );
}