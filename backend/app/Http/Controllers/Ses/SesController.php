<?php

namespace App\Http\Controllers\Ses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ComunicacionSES;
use App\Models\Reserva;
use App\Services\SES\SesAltaReservaService;
use App\Models\ViajeroParte;



class SesController extends Controller
{
    public function logs()
    {
        $logs = ComunicacionSES::with([
                'reserva.persona',
                'reserva.contrato'
            ])
            ->orderBy('fecha_peticion', 'desc')
            ->get();

        $response = $logs->map(function ($log) {

            $reserva = $log->reserva;

            if (!$reserva) {
                return null;
            }

            return [
                'id' => $log->idComunicacionSES,

                'reserva_id' => $reserva->idReserva,

                'titular_nombre' =>
                    $reserva->persona->nombre . ' ' .
                    $reserva->persona->apellido1,

                'estado_ses' => strtoupper($log->estado_ses ?? 'PENDIENTE'),

                'num_lote' => $log->codigo_lote,

                'fecha_envio' => $log->fecha_peticion,

                /*
                | RELACIONES DE MODIFICACIÓN
                | (esto depende de tu lógica de negocio)
                */
                'sustituida_por' => $reserva->reserva_sustituida_por ?? null,

                'proviene_de' => $reserva->reserva_proviene_de ?? null,

                /*
                | VIAJEROS DEL CONTRATO
                */
                'num_viajeros' => $reserva->contrato
                    ? ViajeroParte::whereHas('parte', function ($q) use ($reserva) {
                        $q->where('referenciaContrato', $reserva->contrato->referencia);
                    })->count()-1 
                    : 0,

                'mensaje_backend' => $log->descripcion_estado,
            ];
        })
        ->filter() // elimina nulls
        ->values();

        return response()->json($response);
    }

    public function anularSES($id)
    {
        try {

            /*
            | 1. BUSCAR RESERVA
            */

            $reserva = Reserva::findOrFail($id);

            /*
            | 2. BUSCAR COMUNICACION SES
            */

            $comunicacion = ComunicacionSES::where('idReserva', $id)
                ->whereNotNull('codigo_comunicacion')
                ->latest()
                ->first();

            if (!$comunicacion) {

                return response()->json([
                    'error' => 'No existe comunicación SES'
                ], 404);
            }

            /*
            | 3. ENVIAR ANULACION
            */

            $resultado = app(
                \App\Services\SES\SesAnulacionComunicacionService::class
            )->anular($comunicacion);

            /*
            | 4. ESPERAR PROCESAMIENTO SES
            */

            sleep(5);

            /*
            | 5. CONSULTAR COMUNICACION
            */

            $verificacion = app(
                \App\Services\SES\SesConsultaComunicacionService::class
            )->consultar($comunicacion);


            

            return response()->json([
                'success' => true,
                'resultado' => $resultado
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'error' => 'Reserva no encontrada'
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
