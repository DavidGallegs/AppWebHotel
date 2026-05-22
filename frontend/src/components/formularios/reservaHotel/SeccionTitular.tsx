import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { type TReserva } from "./esquemaReserva";
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio";

/* * COMPONENTE: SeccionTitular
 * Propósito: Recoge la información de la persona que se hace responsable del pago y de la reserva.
 * Es una versión un poco más estricta que la de un simple "viajero".
 */
export function SeccionTitular() {
    const { register, control } = useFormContext<TReserva>();
    
    // Necesitamos saber qué país elige al momento, para mostrarle el buscador de municipios o el input normal
    const paisSeleccionado = useWatch({ control, name: "titular.pais" });

    return (
        <fieldset className="seccion-titular">
            <legend>Datos del Titular y Reserva</legend>

            <div className="input-group">
                <label htmlFor="num-personas">Número total de personas en la reserva:</label>
                <select id="num-personas" {...register("numPersonas", { valueAsNumber: true })}>
                    <option value="1">1 Persona</option>
                    <option value="2">2 Personas</option>
                    <option value="3">3 Personas</option>
                </select>
            </div>

            {/* El rol "TI" indica al backend que esta persona es el Titular */}
            <input type="hidden" value="TI" {...register("titular.rol")} />
            
            <input type="text" placeholder="Nombre" aria-label="Nombre del titular" {...register("titular.nombre")} />
            <input type="text" placeholder="Primer Apellido" aria-label="Primer Apellido" {...register("titular.apellido1")} />
            <input type="text" placeholder="Segundo Apellido" aria-label="Segundo Apellido" {...register("titular.apellido2")} />
            
            <select aria-label="Tipo de documento de identidad" {...register("titular.tipoDocumento")}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIF">NIF</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>
            
            <input type="text" placeholder="Número Documento" aria-label="Número de documento de identidad" {...register("titular.numeroDocumento")} />
            <input type="text" placeholder="Soporte Documento" aria-label="Número de soporte del documento" {...register("titular.soporteDocumento")} />
            
            {/* Indicamos que es la fecha de nacimiento */}
            <input type="date" aria-label="Fecha de nacimiento del titular" {...register("titular.fechaNacimiento")} />
            
            {/* Datos de contacto (obligatorios al menos uno por la validación de Zod) */}
            <input type="tel" placeholder="Teléfono" aria-label="Número de teléfono" {...register("titular.telefono")} />
            <input type="email" placeholder="Correo" aria-label="Correo electrónico" {...register("titular.correo")} />
            
            <input type="text" placeholder="Dirección" aria-label="Dirección de residencia" {...register("titular.direccion")} />
            <input type="text" placeholder="Código Postal" aria-label="Código Postal" {...register("titular.codigoPostal")} />
            
            <select aria-label="País de residencia" {...register("titular.pais")}>
                <option value="">Selecciona País...</option>
                {listaPaises.map((pais) => (
                    <option key={pais.codigo3} value={pais.codigo3}>{pais.nombre}</option>
                ))}
            </select>

            {/* Lógica condicional geográfica para España vs Extranjero */}
            {paisSeleccionado === "ESP" ? (
                <div className="campo-municipio-largo">
                    <BuscadorMunicipio name="titular.codigoMunicipio" />
                </div>
            ) : (
                <div className="campo-municipio-largo">
                    <input type="text" placeholder="Nombre de Ciudad" aria-label="Ciudad de residencia en el extranjero" {...register("titular.nombreMunicipio")} />
                </div>
            )}
        </fieldset>
    );
}