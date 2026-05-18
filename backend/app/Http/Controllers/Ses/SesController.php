<?php

namespace App\Http\Controllers\Ses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Parte;
use App\Services\SES\SesAltaReservaService;

class SesController extends Controller
{
    public function alta(Parte $parte, SesAltaReservaService $service)
    {
        $resultado = $service->enviarParte($parte);

        return response()->json([
            'success' => $resultado['ok'],

            'status' => $resultado['ok'] ? 'sent' : 'error',

            'data' => [
                'parte_id' => $parte->idParte,
                'lote' => $resultado['lote'] ?? null,
                'codigo_comunicacion' => $resultado['codigo_comunicacion'] ?? null,
            ],

            'ses' => [
                'codigo_respuesta' => $resultado['ses_codigo'] ?? null,
                'descripcion' => $resultado['ses_descripcion'] ?? null,
            ]
        ], $resultado['ok'] ? 200 : 422);
    }
}
