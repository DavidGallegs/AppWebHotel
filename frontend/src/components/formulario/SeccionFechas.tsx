import { useFormContext } from "react-hook-form";
import { type IFormularioSes } from "./Formulario";

export function SeccionFechas() {
    const { register } = useFormContext<IFormularioSes>();

    return (
        <fieldset className="seccion-fechas">
            <legend>Datos de la Reserva</legend>
            
            <div className="input-group">
                <label htmlFor="fechaEntrada">Fecha de Entrada:</label>
                <input 
                    id="fechaEntrada"
                    type="date" 
                    {...register("fechaEntrada")} 
                />
            </div>

            <div className="input-group">
                <label htmlFor="fechaSalida">Fecha de Salida:</label>
                <input 
                    id="fechaSalida"
                    type="date" 
                    {...register("fechaSalida")} 
                />
            </div>
        </fieldset>
    );
}