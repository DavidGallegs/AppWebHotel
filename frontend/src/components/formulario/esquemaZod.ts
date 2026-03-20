import { z } from "zod";

// --- FUNCIONES AUXILIARES ---

// Calcular edad exacta
const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

// Validar DNI/NIE real (cálculo de letra)
const validarDniNie = (documento: string): boolean => {
    const validChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    const nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    const str = documento.toUpperCase().replace(/\s/g, '');

    if (!nifRexp.test(str) && !nieRexp.test(str)) return false;

    const nie = str.replace(/^[X]/, '0').replace(/^[Y]/, '1').replace(/^[Z]/, '2');
    const letter = str.substr(-1);
    const charIndex = parseInt(nie.substr(0, 8)) % 23;

    return validChars.charAt(charIndex) === letter;
};

// --- ESQUEMA BASE (Campos compartidos) ---
const personaBaseSchema = z.object({
    nombre: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
    apellido1: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
    apellido2: z.string().max(50, "Máximo 50 caracteres").optional(),
    fechaNacimiento: z.string().refine((fecha) => new Date(fecha) <= new Date(), {
        message: "La fecha no puede estar en el futuro",
    }),
    tipoDocumento: z.string().optional(),
    numeroDocumento: z.string().optional(),
    pais: z.string().length(3, "El código de país debe tener 3 letras (ej. ESP)"),
    codigoMunicipio: z.string().optional(),
    nombreMunicipio: z.string().optional(),
    direccion: z.string().min(1, "Requerido"),
    codigoPostal: z.string().min(1, "Requerido"),
});

// --- ESQUEMA TITULAR ---
export const titularSchema = personaBaseSchema.extend({
    rol: z.literal("TI"),
    telefono: z.string().optional(),
    correo: z.string().email("Formato de correo inválido").or(z.literal("")).optional(),
    soporteDocumento: z.string().optional(),
}).superRefine((data, ctx) => {
    const edad = calcularEdad(data.fechaNacimiento);

    // 1. Mayoría de edad del Titular
    if (edad < 18) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El titular debe ser mayor de edad",
            path: ["fechaNacimiento"],
        });
    }

    // 2. Contacto mínimo
    if (!data.telefono && !data.correo) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe proporcionar al menos un teléfono o un correo",
            path: ["telefono"], // Mostramos el error en el input de teléfono
        });
    }

    // 3. Documentación Titular (siempre requerida por ser mayor de edad)
    if (!data.tipoDocumento) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["tipoDocumento"] });
    }
    if (!data.numeroDocumento) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["numeroDocumento"] });
    }

    // 4. Lógica DNI/NIF
    if (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIF") {
        if (!data.apellido2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Obligatorio para DNI/NIF", path: ["apellido2"] });
        }
        if (!data.soporteDocumento) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Obligatorio para DNI/NIF", path: ["soporteDocumento"] });
        }
        if (data.numeroDocumento && !validarDniNie(data.numeroDocumento)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "DNI/NIF inválido", path: ["numeroDocumento"] });
        }
    }

    // 5. Lógica de Ubicación
    if (data.pais === "ESP") {
        if (!data.codigoMunicipio || !/^\d{5}$/.test(data.codigoMunicipio)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ser un código de 5 dígitos", path: ["codigoMunicipio"] });
        }
    } else {
        if (!data.nombreMunicipio) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido para extranjeros", path: ["nombreMunicipio"] });
        }
    }
});

// --- ESQUEMA ACOMPAÑANTE ---
export const acompananteSchema = personaBaseSchema.extend({
    rol: z.literal("VI"),
    parentesco: z.string().optional(),
}).superRefine((data, ctx) => {
    const edad = calcularEdad(data.fechaNacimiento);

    // 1. Lógica de Edad
    if (edad >= 18) {
        if (!data.tipoDocumento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido para mayores", path: ["tipoDocumento"] });
        if (!data.numeroDocumento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido para mayores", path: ["numeroDocumento"] });
    } else {
        if (!data.parentesco) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido para menores de edad", path: ["parentesco"] });
        }
    }

    // 2. Lógica DNI/NIE para acompañantes
    if (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIE" || data.tipoDocumento === "NIF") {
        if (!data.apellido2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Obligatorio para DNI/NIE/NIF", path: ["apellido2"] });
        }
        if (data.numeroDocumento && !validarDniNie(data.numeroDocumento)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Documento inválido", path: ["numeroDocumento"] });
        }
    }

    // 3. Lógica de Ubicación
    if (data.pais === "ESP") {
        if (!data.codigoMunicipio || !/^\d{5}$/.test(data.codigoMunicipio)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ser un código de 5 dígitos", path: ["codigoMunicipio"] });
        }
    } else {
        if (!data.nombreMunicipio) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["nombreMunicipio"] });
        }
    }
});

// --- ESQUEMA GLOBAL (El Formulario Completo) ---
export const esquemaFormularioSes = z.object({
    fechaEntrada: z.string().min(1, "Requerido"),
    fechaSalida: z.string().min(1, "Requerido"),
    titular: titularSchema,
    acompanantes: z.array(acompananteSchema),
}).superRefine((data, ctx) => {
    // Coherencia de fechas de reserva
    const entrada = new Date(data.fechaEntrada);
    const salida = new Date(data.fechaSalida);

    if (salida < entrada) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha de salida debe ser igual o posterior a la entrada",
            path: ["fechaSalida"],
        });
    }
});

// Inferimos el tipo TypeScript automáticamente desde Zod
// ¡Esto reemplaza tus interfaces manuales ITitular, IAcompanante, etc.!
export type TFormularioSes = z.infer<typeof esquemaFormularioSes>;