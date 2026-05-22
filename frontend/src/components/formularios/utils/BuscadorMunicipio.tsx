import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import datasetMunicipios from "./municipios.json"; 

interface Props {
    name: string; 
}

/* * COMPONENTE: BuscadorMunicipio
 * Propósito: Input autocompletable que busca municipios españoles en un JSON local.
 * Sincroniza el ID del municipio seleccionado con el estado de react-hook-form.
 */
export function BuscadorMunicipio({ name }: Props) {
    const { register, setValue, control } = useFormContext();
    const [busqueda, setBusqueda] = useState("");
    const [mostrarOpciones, setMostrarOpciones] = useState(false);

    // Vigilamos si el municipio cambia desde fuera (ej: al cargar datos por defecto)
    const valorActual = useWatch({ control, name });

    useEffect(() => {
        if (valorActual) {
            const mun = datasetMunicipios.find((m: any) => m.municipio_id === valorActual);
            if (mun) setBusqueda(mun.nombre);
        } else {
            setBusqueda("");
        }
    }, [valorActual]);

    // Filtrado en tiempo real basado en lo que escribe el usuario
    const municipiosFiltrados = busqueda
        ? datasetMunicipios
              .filter((m: any) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))
              .slice(0, 50)
        : datasetMunicipios.slice(0, 50);

    const seleccionarMunicipio = (municipio_id: string, nombre: string) => {
        setBusqueda(nombre); 
        setValue(name, municipio_id, { shouldValidate: true }); 
        setMostrarOpciones(false); 
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(e.target.value);
        setMostrarOpciones(true);
        if (valorActual) {
            setValue(name, "", { shouldValidate: true });
        }
    };

    return (
        <div className="buscador-municipio">
            {/* Input oculto que realmente guarda el ID para React Hook Form */}
            <input type="hidden" {...register(name as any)} />

            {/* ACCESIBILIDAD: Rol combobox, controles y estados expandidos */}
            <input
                className="buscador-municipio-input"
                type="text"
                role="combobox"
                aria-expanded={mostrarOpciones}
                aria-controls="lista-municipios-sugerencias"
                aria-label="Buscar municipio por nombre"
                placeholder="Escribe para buscar municipio..."
                value={busqueda}
                onChange={manejarCambio}
                onFocus={() => setMostrarOpciones(true)}
                onBlur={() => setTimeout(() => setMostrarOpciones(false), 200)}
                autoComplete="off"
            />

            {mostrarOpciones && (
                // Lista de opciones semánticas
                <ul 
                    id="lista-municipios-sugerencias" 
                    className="buscador-municipio-lista" 
                    role="listbox"
                >
                    {municipiosFiltrados.length > 0 ? (
                        municipiosFiltrados.map((mun: any) => (
                            <li
                                key={mun.municipio_id}
                                className="buscador-municipio-item"
                                role="option"
                                aria-selected={valorActual === mun.municipio_id}
                                onMouseDown={() => seleccionarMunicipio(mun.municipio_id, mun.nombre)}
                            >
                                {mun.nombre} 
                                <span className="buscador-municipio-codigo">({mun.municipio_id})</span>
                            </li>
                        ))
                    ) : (
                        <li className="buscador-municipio-empty" role="option" aria-disabled="true">
                            No se encontraron municipios
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}