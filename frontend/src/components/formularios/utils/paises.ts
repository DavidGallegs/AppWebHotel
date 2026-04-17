import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

countries.registerLocale(es);
const paisesObjeto = countries.getNames("es", { select: "official" });

const listaCruda = Object.entries(paisesObjeto).map(([codigo2, nombre]) => ({
    codigo3: countries.alpha2ToAlpha3(codigo2) || "",
    nombre,
}));

export const listaPaises = [
    ...listaCruda.filter(pais => pais.codigo3 === "ESP"),
    ...listaCruda
        .filter(pais => pais.codigo3 !== "ESP")
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
];