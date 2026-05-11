<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudModificacionReservaMail;
use App\Mail\SolicitudCancelacionReservaMail;

use App\Models\Reserva;


class NotificacionController extends Controller
{
    public function enviarNotificacion(Request $request)
    {
        $request->validate([
            'tipo' => 'required|string',
            'reservaId' => 'required|integer'
        ]);

        $tipo = $request->tipo;
        $reservaId = $request->reservaId;


        /*
        |--------------------------------------------------------------------------
        | CARGAR RESERVA
        |--------------------------------------------------------------------------
        */

        $reserva = Reserva::with('titular')
            ->where('idReserva', $reservaId)
            ->first();

        if (!$reserva) {

            return response()->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }

        try {

            switch ($tipo) {

                /*
                |--------------------------------------------------------------------------
                | USUARIO -> ADMIN
                |--------------------------------------------------------------------------
                */

                case 'solicitud_modificacion_admin':

                    Mail::to(config('mail.admin_address'))

                        // Cola
                        ->send(
                            new SolicitudModificacionReservaMail(
                                $reserva,
                                $datos = $reserva->datos_modificacion // Aquí puedes pasar los datos que necesites al correo
                            )
                        );

                    break;

                case 'solicitud_cancelacion_admin':

                    Mail::to(config('mail.admin_address'))

                        ->send(
                            new SolicitudCancelacionReservaMail(
                                $reserva
                            )
                        );

                    break;

                
                

                    break;

                default:

                    return response()->json([
                        'error' => 'Tipo de notificación inválido',
                        
                    ], 400);
            }

            return response()->json([
                'message' => 'Notificación enviada correctamente.'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Error enviando la notificación',
                'detalle' => $e->getMessage(),
                'admin_address' => env('MAIL_ADMIN_ADDRESS')
            ], 500);
        }
    }
}
