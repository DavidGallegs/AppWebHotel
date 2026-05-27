import { useFormContext, useWatch } from "react-hook-form";
import { listaPaises } from "../utils/paises"; 
import { type TReserva } from "./esquemaReserva";
import { BuscadorMunicipio } from "../utils/BuscadorMunicipio";

interface Props {
    isAdmin?: boolean;
    userEmail?: string; // El correo de la sesión si es cliente normal
}

export function SeccionTitular({ isAdmin = false, userEmail = "" }: Props) {
    const { register, control, setValue } = useFormContext<TReserva>();
    const paisSeleccionado = useWatch({ control, name: "titular.pais" });

    // Si NO es admin y le pasamos un correo, forzamos ese correo en el formulario para evitar trampas
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
                    {...register("numPersonas", { valueAsNumber: true })}
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

            <input 
                type="text" 
                placeholder="Nombre" 
                {...register("titular.nombre")} 
            />

            <input 
                type="text" 
                placeholder="Primer Apellido" 
                {...register("titular.apellido1")} 
            />

            <input 
                type="text" 
                placeholder="Segundo Apellido" 
                {...register("titular.apellido2")} 
            />

            <select {...register("titular.tipoDocumento")}>
                <option value="">Tipo Documento...</option>
                <option value="DNI">DNI</option>
                <option value="NIF">NIF</option>
                <option value="PASSPORT">Pasaporte</option>
            </select>

            <input 
                type="text" 
                placeholder="Número Documento" 
                {...register("titular.numeroDocumento")} 
            />

            <input 
                type="text" 
                placeholder="Soporte Documento" 
                {...register("titular.soporteDocumento")} 
            />

            <input 
                type="date" 
                {...register("titular.fechaNacimiento")} 
            />

            <input 
                type="tel" 
                placeholder="Teléfono" 
                {...register("titular.telefono")} 
            />

            {/* AQUÍ ESTÁ LA MAGIA DEL CORREO */}
            <input 
                type="email" 
                placeholder="Correo" 
                {...register("titular.correo")} 
                readOnly={!isAdmin} 
                className={!isAdmin ? "campo-bloqueado" : ""}
            />

            <input 
                type="text" 
                placeholder="Dirección" 
                {...register("titular.direccion")} 
            />

            <input 
                type="text" 
                placeholder="Código Postal" 
                {...register("titular.codigoPostal")} 
            />

            <select {...register("titular.pais")}>
                <option value="">Selecciona País...</option>

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
                    <input 
                        type="text" 
                        placeholder="Nombre de Ciudad" 
                        {...register("titular.nombreMunicipio")} 
                    />
                </div>
            )}
        </fieldset>
    );
}