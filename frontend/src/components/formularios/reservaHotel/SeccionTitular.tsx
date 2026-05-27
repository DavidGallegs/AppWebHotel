import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { type TReserva } from "./esquemaReserva";
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio";

interface Props {
    isAdmin?: boolean;
    userEmail?: string;
}

export function SeccionTitular({ isAdmin = false, userEmail = "" }: Props) {

    const { register, control, setValue } = useFormContext<TReserva>();

    const paisSeleccionado = useWatch({
        control,
        name: "titular.pais"
    });

    // Si NO es admin y le pasamos un correo, forzamos ese correo
    if (!isAdmin && userEmail) {
        setValue('titular.correo', userEmail);
    }

    return (

        <fieldset className="seccion-titular">

            <legend>Datos del Titular y Reserva</legend>

            <div className="input-group">

                <label htmlFor="num-personas">
                    Número total de personas en la reserva:
                </label>

                <select
                    id="num-personas"
                    {...register("numPersonas", {
                        valueAsNumber: true
                    })}
                >
                    <option value="1">1 Persona</option>
                    <option value="2">2 Personas</option>
                    <option value="3">3 Personas</option>
                </select>

            </div>

            <input
                type="hidden"
                value="TI"
                {...register("titular.rol")}
            />

            {/* ERROR 1 -> INPUT SIN NOMBRE ACCESIBLE */}
            <input
                type="text"
                {...register("titular.nombre")}
            />

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.apellido1")}
            />

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.apellido2")}
            />

            {/* ERROR 2 -> SELECT SIN LABEL NI ARIA-LABEL */}
            <select {...register("titular.tipoDocumento")}>

                <option value="">
                    Tipo Documento...
                </option>

                <option value="DNI">
                    DNI
                </option>

                <option value="NIF">
                    NIF
                </option>

                <option value="PASSPORT">
                    Pasaporte
                </option>

            </select>

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.numeroDocumento")}
            />

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.soporteDocumento")}
            />

            {/* ERROR 1 */}
            <input
                type="date"
                {...register("titular.fechaNacimiento")}
            />

            {/* ERROR 1 */}
            <input
                type="tel"
                {...register("titular.telefono")}
            />

            {/* ERROR 1 */}
            <input
                type="email"
                {...register("titular.correo")}
                readOnly={!isAdmin}
                className={!isAdmin ? "campo-bloqueado" : ""}
            />

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.direccion")}
            />

            {/* ERROR 1 */}
            <input
                type="text"
                {...register("titular.codigoPostal")}
            />

            {/* ERROR 2 */}
            <select {...register("titular.pais")}>

                <option value="">
                    Selecciona País...
                </option>

                {listaPaises.map((pais) => (

                    <option
                        key={pais.codigo3}
                        value={pais.codigo3}
                    >
                        {pais.nombre}
                    </option>

                ))}

            </select>

            {paisSeleccionado === "ESP" ? (

                <div className="campo-municipio-largo">

                    <BuscadorMunicipio
                        name="titular.codigoMunicipio"
                    />

                </div>

            ) : (

                <div className="campo-municipio-largo">

                    {/* ERROR 1 */}
                    <input
                        type="text"
                        {...register("titular.nombreMunicipio")}
                    />

                </div>

            )}

        </fieldset>

    );

}