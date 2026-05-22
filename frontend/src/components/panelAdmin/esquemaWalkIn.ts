import { z } from "zod";
import { viajeroSchema } from "../formularios/parteViajeros/esquemaViajeros";

/* * ESQUEMA: WalkIn
 * Propósito: Define las reglas estrictas cuando un administrador crea una 
 * reserva y un check-in simultáneamente para un cliente presencial.
 */
export const esquemaWalkIn = z.object({
    habitacion: z.enum(["1", "2"]),
    fechaEntrada: z.string().min(1, "Entrada requerida"),
    fechaSalida: z.string().min(1, "Salida requerida"),
    // Reutilizamos el esquema del viajero y limitamos la capacidad física de la habitación
    viajeros: z.array(viajeroSchema)
        .min(1, "Añada al menos un viajero")
        .max(3, "Máximo 3 viajeros por habitación")
}).superRefine((data, ctx) => {
    // Validamos la lógica del tiempo: salida posterior a entrada
    if (data.fechaEntrada && data.fechaSalida) {
        if (new Date(data.fechaSalida) <= new Date(data.fechaEntrada)) {
            ctx.addIssue({ code: "custom", message: "Error en fechas", path: ["fechaSalida"] });
        }
    }
});

export type TWalkIn = z.infer<typeof esquemaWalkIn>;