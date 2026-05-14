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

        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::with('persona')
                ->where('idReserva', $reservaId)
                ->first();

            if (!$reserva) {

                $response = [
                    'error' => 'Reserva no encontrada'
                ];

                $status = 404;

            } else {

                /*
                |--------------------------------------------------------------------------
                | REGLA DE NEGOCIO
                |--------------------------------------------------------------------------
                */

                if ($tipo === 'solicitud_modificacion_admin') {

                    // 🔴 pending → no email
                    if ($reserva->estado === 'pending') {

                        $response = [
                            'success' => true,
                            'message' => 'Reserva en pendiente: no requiere notificación'
                        ];

                    } else {

                        // 🟡 approved → email admin
                        $datos = $reserva->datos_modificacion;

                        if (is_string($datos)) {
                            $datos = json_decode($datos, true);
                        }

                        Mail::to(config('mail.admin_address'))
                            ->send(
                                new SolicitudModificacionReservaMail(
                                    $reserva,
                                    $datos ?? [
                                        'reserva' => [],
                                        'titular' => []
                                    ]
                                )
                            );

                        $response = [
                            'success' => true,
                            'message' => 'Notificación de modificación enviada correctamente'
                        ];
                    }

                } elseif ($tipo === 'solicitud_cancelacion_admin') {

                    if ($reserva->estado === 'pending') {

                        $response = [
                            'success' => true,
                            'message' => 'Cancelación en pendiente: sin notificación'
                        ];

                    } else {

                        Mail::to(config('mail.admin_address'))
                            ->send(
                                new SolicitudCancelacionReservaMail($reserva)
                            );

                        $response = [
                            'success' => true,
                            'message' => 'Notificación de cancelación enviada correctamente'
                        ];
                    }

                } else {

                    $response = [
                        'error' => 'Tipo de notificación inválido'
                    ];

                    $status = 400;
                }
            }

        } catch (\Exception $e) {

            $response = [
                'error' => 'Error enviando la notificación',
                'detalle' => $e->getMessage(),
                'admin_address' => env('MAIL_ADMIN_ADDRESS')
            ];

            $status = 500;
        }

        return response()->json($response, $status);
    }
}
