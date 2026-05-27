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

    if (!isAdmin && userEmail) {
        setValue("titular.correo", userEmail);
    }

    return (
        <fieldset className="seccion-titular">
            <legend>Datos del Titular y Reserva</legend>

            {/* Nº PERSONAS */}
            <div className="input-group">
                <label htmlFor="num-personas">
                    Número total de personas en la reserva:
                </label>

                <select
                    id="num-personas"
                    {...register("numPersonas", { valueAsNumber: true })}
                >
                    <option value="1">1 Persona</option>
                    <option value="2">2 Personas</option>
                    <option value="3">3 Personas</option>
                </select>
            </div>

            <input type="hidden" value="TI" {...register("titular.rol")} />

            {/* NOMBRE */}
            <div className="input-group">
                <label htmlFor="titular-nombre">Nombre</label>
                <input
                    id="titular-nombre"
                    type="text"
                    {...register("titular.nombre")}
                />
            </div>

            {/* APELLIDO 1 */}
            <div className="input-group">
                <label htmlFor="titular-apellido1">Primer apellido</label>
                <input
                    id="titular-apellido1"
                    type="text"
                    {...register("titular.apellido1")}
                />
            </div>

            {/* APELLIDO 2 */}
            <div className="input-group">
                <label htmlFor="titular-apellido2">Segundo apellido</label>
                <input
                    id="titular-apellido2"
                    type="text"
                    {...register("titular.apellido2")}
                />
            </div>

            {/* TIPO DOCUMENTO */}
            <div className="input-group">
                <label htmlFor="tipo-documento">Tipo de documento</label>

                <select
                    id="tipo-documento"
                    {...register("titular.tipoDocumento")}
                >
                    <option value="">Selecciona tipo...</option>
                    <option value="DNI">DNI</option>
                    <option value="NIF">NIF</option>
                    <option value="PASSPORT">Pasaporte</option>
                </select>
            </div>

            {/* Nº DOCUMENTO */}
            <div className="input-group">
                <label htmlFor="num-documento">Número de documento</label>
                <input
                    id="num-documento"
                    type="text"
                    {...register("titular.numeroDocumento")}
                />
            </div>

            {/* SOPORTE */}
            <div className="input-group">
                <label htmlFor="soporte-documento">Soporte documento</label>
                <input
                    id="soporte-documento"
                    type="text"
                    {...register("titular.soporteDocumento")}
                />
            </div>

            {/* FECHA NACIMIENTO */}
            <div className="input-group">
                <label htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
                <input
                    id="fecha-nacimiento"
                    type="date"
                    {...register("titular.fechaNacimiento")}
                />
            </div>

            {/* TELÉFONO */}
            <div className="input-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                    id="telefono"
                    type="tel"
                    {...register("titular.telefono")}
                />
            </div>

            {/* CORREO */}
            <div className="input-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                    id="correo"
                    type="email"
                    {...register("titular.correo")}
                    readOnly={!isAdmin}
                    className={!isAdmin ? "campo-bloqueado" : ""}
                />
            </div>

            {/* DIRECCIÓN */}
            <div className="input-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                    id="direccion"
                    type="text"
                    {...register("titular.direccion")}
                />
            </div>

            {/* CP */}
            <div className="input-group">
                <label htmlFor="cp">Código Postal</label>
                <input
                    id="cp"
                    type="text"
                    {...register("titular.codigoPostal")}
                />
            </div>

            {/* PAÍS */}
            <div className="input-group">
                <label htmlFor="pais">País</label>

                <select id="pais" {...register("titular.pais")}>
                    <option value="">Selecciona País...</option>
                    {listaPaises.map((pais) => (
                        <option key={pais.codigo3} value={pais.codigo3}>
                            {pais.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* MUNICIPIO */}
            {paisSeleccionado === "ESP" ? (
                <div className="campo-municipio-largo">
                    <BuscadorMunicipio name="titular.codigoMunicipio" />
                </div>
            ) : (
                <div className="campo-municipio-largo">
                    <label htmlFor="municipio">Municipio</label>
                    <input
                        id="municipio"
                        type="text"
                        {...register("titular.nombreMunicipio")}
                    />
                </div>
            )}
        </fieldset>
    );
}