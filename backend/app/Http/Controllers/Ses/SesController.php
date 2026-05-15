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
            'ok' => $resultado['ok'],
            'estado' => $resultado['ok'] ? 'ENVIADA' : 'ERROR',
            'lote' => $resultado['lote'] ?? null,
            'codigo_comunicacion' => $resultado['codigo_comunicacion'] ?? null,
        ]);
    }
}
