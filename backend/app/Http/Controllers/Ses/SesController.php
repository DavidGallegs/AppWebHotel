<?php

namespace App\Http\Controllers\Ses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ComunicacionSES;
use App\Models\Reserva;
use App\Services\SES\SesAltaReservaService;


class SesController extends Controller
{
    public function logs()
    {
        $logs = ComunicacionSES::orderBy('fecha_peticion', 'desc')
            ->get()
            ->map(function ($log) {

                return [
                    'reserva_id' => $log->idReserva,

                    'accion' => $log->tipo_comunicacion,

                    'estado' => $log->estado_ses,

                    'mensaje' => $log->descripcion_estado,

                    'fecha' => $log->fecha_peticion,
                ];
            });

        return response()->json($logs);
    }

    public function anularSES($id)
    {
        try {

            /*
            |---------------------------------------------------
            | 1. BUSCAR RESERVA
            |---------------------------------------------------
            */

            $reserva = Reserva::findOrFail($id);

            /*
            |---------------------------------------------------
            | 2. BUSCAR COMUNICACION SES
            |---------------------------------------------------
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
            |---------------------------------------------------
            | 3. ENVIAR ANULACION
            |---------------------------------------------------
            */

            $resultado = app(
                \App\Services\SES\SesAnulacionComunicacionService::class
            )->anular($comunicacion);

            /*
            |---------------------------------------------------
            | 4. ESPERAR PROCESAMIENTO SES
            |---------------------------------------------------
            */

            sleep(5);

            /*
            |---------------------------------------------------
            | 5. CONSULTAR COMUNICACION
            |---------------------------------------------------
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
