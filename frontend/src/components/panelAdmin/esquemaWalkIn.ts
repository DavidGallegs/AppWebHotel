import { z } from "zod";
import { viajeroSchema } from "../formularios/parteViajeros/esquemaViajeros";

export const esquemaWalkIn = z.object({
    habitacion: z.enum(["1", "2"]),
    fechaEntrada: z.string().min(1, "Entrada requerida"),
    fechaSalida: z.string().min(1, "Salida requerida"),
    // AÑADIDO: Límite máximo de 3 viajeros
    viajeros: z.array(viajeroSchema)
        .min(1, "Añada al menos un viajero")
        .max(3, "Máximo 3 viajeros por habitación")
}).superRefine((data, ctx) => {
    if (data.fechaEntrada && data.fechaSalida) {
        if (new Date(data.fechaSalida) <= new Date(data.fechaEntrada)) {
            ctx.addIssue({ code: "custom", message: "Error en fechas", path: ["fechaSalida"] });
        }
    }
});

export type TWalkIn = z.infer<typeof esquemaWalkIn>;