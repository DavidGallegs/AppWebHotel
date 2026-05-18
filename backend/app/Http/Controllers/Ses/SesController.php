<?php

namespace App\Http\Controllers\Ses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Model\ComunicacionesSES;


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
}
