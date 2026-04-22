import { z } from "zod";

export const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

export const validarDniNie = (documento: string): boolean => {
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

export const personaBaseSchema = z.object({
    nombre: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
    apellido1: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
    apellido2: z.string().max(50, "Máximo 50 caracteres").optional(),
    fechaNacimiento: z.string().refine((fecha) => new Date(fecha) <= new Date(), {
        message: "La fecha no puede estar en el futuro",
    }),
    tipoDocumento: z.string().optional(),
    numeroDocumento: z.string().max(15, "Máximo 15 caracteres").optional(),
    pais: z.string().length(3, "El código de país debe tener 3 letras (ej. ESP)"),
    codigoMunicipio: z.string().optional(),
    nombreMunicipio: z.string().max(100, "Máximo 100 caracteres").optional(),
    direccion: z.string().min(1, "Requerido").max(100, "Máximo 100 caracteres"),
    codigoPostal: z.string().min(1, "Requerido").max(20, "Máximo 20 caracteres"),
});