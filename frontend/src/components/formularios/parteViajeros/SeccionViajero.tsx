import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio"; 
import opciones_parentesco from '../utils/parentescos.json';

interface PropsViajero {
    index: number;
    remover: () => void;
}

export function SeccionViajero({ index, remover }: PropsViajero) {
    // CAMBIO CLAVE: Quitamos <TParteViajeros> y lo dejamos como <any>
    const { register, control } = useFormContext<any>();
    
    // Al usar <any>, podemos mantener el acceso dinámico por index sin que TS se queje
    const paisSeleccionado = useWatch({ control, name: `viajeros.${index}.pais` });

    return (
        <fieldset className="seccion-acompanante">
            <legend>Datos del Viajero #{index + 1}</legend>
            <button type="button" onClick={remover} style={{ float: 'right' }} className="btn-action btn-danger-soft">
                X Eliminar
            </button>
            
            {/* Es importante mantener el `as const` en los names si usaras tipado estricto, pero con <any> no es necesario, aunque no hace daño */}
            <input type="hidden" value="VI" {...register(`viajeros.${index}.rol`)} />
            <input type="text" placeholder="Nombre" {...register(`viajeros.${index}.nombre`)} />
            <input type="text" placeholder="Primer Apellido" {...register(`viajeros.${index}.apellido1`)} />
            <input type="text" placeholder="Segundo Apellido" {...register(`viajeros.${index}.apellido2`)} />
            
            <select {...register(`viajeros.${index}.tipoDocumento`)}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" {...register(`viajeros.${index}.numeroDocumento`)} />
            <input type="text" placeholder="Soporte Documento" {...register(`viajeros.${index}.soporteDocumento`)} />
            <input type="date" {...register(`viajeros.${index}.fechaNacimiento`)} />
            
            <select {...register(`viajeros.${index}.parentesco`)} defaultValue="">
                <option value="">Selecciona un parentesco</option>
                {opciones_parentesco.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                ))}
            </select>
            
            <input type="text" placeholder="Dirección" {...register(`viajeros.${index}.direccion`)} />
            <input type="text" placeholder="Código Postal" {...register(`viajeros.${index}.codigoPostal`)} />
            
            <select {...register(`viajeros.${index}.pais`)}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>{pais.nombre}</option>
                ))}
            </select>

            {paisSeleccionado === "ESP" ? (
                <BuscadorMunicipio name={`viajeros.${index}.codigoMunicipio`} />
            ) : (
                <input type="text" placeholder="Nombre de Ciudad" {...register(`viajeros.${index}.nombreMunicipio`)} />
            )}
        </fieldset>
    );
}