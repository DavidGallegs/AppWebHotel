import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import datasetMunicipios from "./municipios.json"; 

interface Props {
    name: string; 
}

export function BuscadorMunicipio({ name }: Props) {
    const { register, setValue, control } = useFormContext();
    const [busqueda, setBusqueda] = useState("");
    const [mostrarOpciones, setMostrarOpciones] = useState(false);

    const valorActual = useWatch({ control, name });

    useEffect(() => {
        if (valorActual) {
            const mun = datasetMunicipios.find((m: any) => m.municipio_id === valorActual);
            if (mun) setBusqueda(mun.nombre);
        } else {
            setBusqueda("");
        }
    }, [valorActual]);

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
            <input type="hidden" {...register(name as any)} />

            <input
                type="text"
                placeholder="Escribe para buscar municipio..."
                value={busqueda}
                onChange={manejarCambio}
                onFocus={() => setMostrarOpciones(true)}
                onBlur={() => setTimeout(() => setMostrarOpciones(false), 200)}
                autoComplete="off"
            />

            {mostrarOpciones && (
                <ul className="buscador-municipio-lista">
                    {municipiosFiltrados.length > 0 ? (
                        municipiosFiltrados.map((mun: any) => (
                            <li
                                key={mun.municipio_id}
                                className="buscador-municipio-item"
                                onMouseDown={() => seleccionarMunicipio(mun.municipio_id, mun.nombre)}
                            >
                                {mun.nombre} 
                                <span className="buscador-municipio-codigo">({mun.municipio_id})</span>
                            </li>
                        ))
                    ) : (
                        <li className="buscador-municipio-empty">No se encontraron municipios</li>
                    )}
                </ul>
            )}
        </div>
    );
}