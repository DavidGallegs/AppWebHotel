import { z } from "zod";
import { personaBaseSchema, calcularEdad, validarDniNie } from "../utils/validacionesZod";

export const viajeroSchema = personaBaseSchema.extend({
    rol: z.literal("VI"),
    parentesco: z.string().max(5).optional(),
    soporteDocumento: z.string().max(9).optional(),
}).superRefine((data, ctx) => {
    const edad = calcularEdad(data.fechaNacimiento);
    if (edad >= 18) {
        if (!data.tipoDocumento) ctx.addIssue({ code: "custom", message: "Requerido para mayores", path: ["tipoDocumento"] });
        if (!data.numeroDocumento) ctx.addIssue({ code: "custom", message: "Requerido para mayores", path: ["numeroDocumento"] });
    } else {
        if (!data.parentesco) ctx.addIssue({ code: "custom", message: "Requerido para menores", path: ["parentesco"] });
    }
    if (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIE" || data.tipoDocumento === "NIF") {
        if (!data.apellido2) ctx.addIssue({ code: "custom", message: "Obligatorio", path: ["apellido2"] });
        if (!data.soporteDocumento) ctx.addIssue({ code: "custom", message: "Obligatorio", path: ["soporteDocumento"] });
        if (data.numeroDocumento && !validarDniNie(data.numeroDocumento)) ctx.addIssue({ code: "custom", message: "Documento inválido", path: ["numeroDocumento"] });
    }
    if (data.pais === "ESP") {
        if (!data.codigoMunicipio || !/^\d{5}$/.test(data.codigoMunicipio)) ctx.addIssue({ code: "custom", message: "Código de 5 dígitos", path: ["codigoMunicipio"] });
    } else {
        if (!data.nombreMunicipio) ctx.addIssue({ code: "custom", message: "Requerido", path: ["nombreMunicipio"] });
    }
});

export const esquemaParteViajeros = z.object({
    // Podrías añadir un campo "reservaId" si necesitas vincularlo en el backend
    viajeros: z.array(viajeroSchema).min(1, "Debe añadir al menos un viajero")
});

export type TParteViajeros = z.infer<typeof esquemaParteViajeros>;