import { z } from "zod";
import { personaBaseSchema, calcularEdad, validarDniNie } from "../utils/validacionesZod";

export const titularSchema = personaBaseSchema.extend({
    rol: z.literal("TI"),
    telefono: z.string().regex(/^\+?[0-9\s]{9,20}$/, "Formato inválido").max(20).or(z.literal("")).optional(),
    correo: z.email("Formato inválido").max(250).or(z.literal("")).optional(),
    soporteDocumento: z.string().max(9).optional(),
}).superRefine((data, ctx) => {
    const edad = calcularEdad(data.fechaNacimiento);
    if (edad < 18) ctx.addIssue({ code: "custom", message: "Debe ser mayor de edad", path: ["fechaNacimiento"] });
    if (!data.telefono && !data.correo) ctx.addIssue({ code: "custom", message: "Proporcione teléfono o correo", path: ["telefono"] });
    if (!data.tipoDocumento) ctx.addIssue({ code: "custom", message: "Requerido", path: ["tipoDocumento"] });
    if (!data.soporteDocumento && (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIF")) ctx.addIssue({ code: "custom", message: "Obligatorio para DNI/NIF", path: ["soporteDocumento"] });
    if (!data.numeroDocumento) ctx.addIssue({ code: "custom", message: "Requerido", path: ["numeroDocumento"] });
    if (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIF") {
        if (!data.apellido2) ctx.addIssue({ code: "custom", message: "Obligatorio para DNI/NIF", path: ["apellido2"] });
        if (data.numeroDocumento && !validarDniNie(data.numeroDocumento)) ctx.addIssue({ code: "custom", message: "Documento inválido", path: ["numeroDocumento"] });
    }
    if (data.pais === "ESP") {
        if (!data.codigoMunicipio || !/^\d{5}$/.test(data.codigoMunicipio)) ctx.addIssue({ code: "custom", message: "Código de 5 dígitos", path: ["codigoMunicipio"] });
    } else {
        if (!data.nombreMunicipio) ctx.addIssue({ code: "custom", message: "Requerido para extranjeros", path: ["nombreMunicipio"] });
    }
});

export const esquemaReserva = z.object({
    habitacion: z.enum(["1", "2"]).default("1"),
    fechaEntrada: z.string().min(1, "Requerido"),
    fechaSalida: z.string().min(1, "Requerido"),
    numPersonas: z.number().min(1, "Debe haber al menos 1 persona").max(3, "Máximo 3 personas por habitación"),
    titular: titularSchema,
}).superRefine((data, ctx) => {
    const entrada = new Date(data.fechaEntrada);
    const salida = new Date(data.fechaSalida);
    if (salida < entrada) {
        ctx.addIssue({ code: "custom", message: "Salida debe ser igual o posterior a la entrada", path: ["fechaSalida"] });
    }
});

export type TReserva = z.infer<typeof esquemaReserva>;