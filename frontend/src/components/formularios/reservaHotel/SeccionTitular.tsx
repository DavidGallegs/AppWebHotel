import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { type TReserva } from "./esquemaReserva";
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio";

export function SeccionTitular() {
    const { register, control } = useFormContext<TReserva>();
    const paisSeleccionado = useWatch({ control, name: "titular.pais" });

    return (
        <fieldset className="seccion-titular">
            <legend>Datos del Titular y Reserva</legend>

            <div className="input-group">
                <label>Número total de personas en la reserva:</label>
                <select {...register("numPersonas", { valueAsNumber: true })}>
                    <option value="1">1 Persona</option>
                    <option value="2">2 Personas</option>
                    <option value="3">3 Personas</option>
                </select>
            </div>

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
                    <option key={pais.codigo3} value={pais.codigo3}>{pais.nombre}</option>
                ))}
            </select>

            {paisSeleccionado === "ESP" ? (
                <div className="campo-municipio-largo"> {/* <-- Añade este div */}
                    <BuscadorMunicipio name="titular.codigoMunicipio" />
                </div>
            ) : (
                <div className="campo-municipio-largo"> {/* <-- Añade este div también aquí */}
                    <input type="text" placeholder="Nombre de Ciudad" {...register("titular.nombreMunicipio")} />
                </div>
            )}
        </fieldset>
    );
}