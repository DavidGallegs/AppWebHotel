<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\Reserva;

class AdminReservaController extends Controller
{
    public function confirmarPago($id)
    {
        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::findOrFail($id);

            /*
            |--------------------------------------------------------------------------
            | VALIDACIÓN
            |--------------------------------------------------------------------------
            */

            if ($reserva->estado_pago !== 'notificado') {

                $response = [

                    'error' => 'El pago aún no ha sido notificado'

                ];

                $status = 400;

            } else {

                /*
                |--------------------------------------------------------------------------
                | TRANSACCIÓN
                |--------------------------------------------------------------------------
                */

                DB::transaction(function () use ($reserva) {

                    /*
                    |--------------------------------------------------------------------------
                    | PAGO
                    |--------------------------------------------------------------------------
                    */

                    $reserva->estado_pago = 'pagado';

                    /*
                    |--------------------------------------------------------------------------
                    | RESERVA
                    |--------------------------------------------------------------------------
                    */

                    $reserva->estado = 'approved';

                    $reserva->updatedAt = now();

                    $reserva->save();
                });

                $response = [

                    'success' => true,
                    'message' => 'Pago confirmado y reserva aprobada'

                ];
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            $response = [

                'error' => 'Reserva no encontrada'

            ];

            $status = 404;

        } catch (\Exception $e) {

            $response = [

                'error' => $e->getMessage()

            ];

            $status = 500;
        }

        return response()->json($response, $status);
    }
}
