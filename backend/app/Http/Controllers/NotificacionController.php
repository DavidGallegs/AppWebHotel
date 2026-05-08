<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

use App\Models\Reserva;

use App\Mail\SolicitudModificacionAdminMail;
use App\Mail\SolicitudCancelacionAdminMail;
use App\Mail\ResolucionSolicitudUsuarioMail;

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
                        ->queue(
                            new SolicitudModificacionAdminMail(
                                $reserva
                            )
                        );

                    break;

                case 'solicitud_cancelacion_admin':

                    Mail::to(config('mail.admin_address'))

                        ->queue(
                            new SolicitudCancelacionAdminMail(
                                $reserva
                            )
                        );

                    break;

                /*
                |--------------------------------------------------------------------------
                | ADMIN -> USUARIO
                |--------------------------------------------------------------------------
                */

                case 'resolucion_mod_user':

                case 'resolucion_cancel_user':

                    if ($reserva->titular?->email) {

                        Mail::to(
                            $reserva->titular->email
                        )

                        ->queue(
                            new ResolucionSolicitudUsuarioMail(
                                $reserva,
                                $tipo
                            )
                        );
                    }

                    break;

                default:

                    return response()->json([
                        'error' => 'Tipo de notificación inválido'
                    ], 400);
            }

            return response()->json([
                'message' => 'Notificación enviada correctamente.'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Error enviando la notificación',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
