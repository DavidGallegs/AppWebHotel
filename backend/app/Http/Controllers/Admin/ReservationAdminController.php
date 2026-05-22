<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reserva;
use App\Models\Contrato;
use App\Models\Parte;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservaConfirmadaMail;
use App\Mail\ReservaCanceladaMail;
use App\Services\SES\SesAltaReservaService;
use App\Models\ComunicacionSES;
use App\Services\SES\SesAnulacionComunicacionService;
use App\Services\SES\SesConsultaComunicacionService;
use App\Services\SES\SesConsultaLoteService;
use Illuminate\Support\Str;

class ReservationAdminController extends Controller
{
    public function indexAdmin(Request $request)
    {
        $response = null;
        $status = 200;
        $user = $request->user();

        if (!$user) {

            $response = [
                'error' => 'No autenticado'
            ];
            $status = 401;
        } else {
            $reservas = Reserva::with([
                    'persona',
                    'habitaciones'
                ])
                ->orderBy('fechaEntrada', 'desc')
                ->get();

            $response = $reservas->map(function ($reserva) {

                return [
                    'id' => $reserva->idReserva,
                    'status' => $reserva->estado,
                    'fechaEntrada' => $reserva->fechaEntrada,
                    'fechaSalida' => $reserva->fechaSalida,

                    'habitacion' => $reserva->habitaciones->pluck('idHabitacion')->first(),

                    'numPersonas' => $reserva->habitaciones->first()?->pivot->numPersonas,
                    'estado_pago' => $reserva->estado_pago,

                    'titular' => [
                        'nombre' => $reserva->persona->nombre,
                        'apellido1' => $reserva->persona->apellido1,
                        'apellido2' => $reserva->persona->apellido2,
                        'tipoDocumento' => $reserva->persona->tipoDocumento,
                        'numeroDocumento' => $reserva->persona->documento,
                        'telefono' => $reserva->persona->telefono,
                        'correo' => $reserva->persona->email,
                        'direccion' => $reserva->persona->direccion,
                        'codigoPostal' => $reserva->persona->cp,
                        'nombreMunicipio' => $reserva->persona->nombreMunicipio,
                        'codigoMunicipio' => $reserva->persona->codigoMunicipio,
                        'pais' => $reserva->persona->nacionalidad,
                    ]
                ];
            });
        }

        return response()->json($response, $status);
    }

    public function rejectReservation($id)
    {
        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::with('persona')
                ->findOrFail($id);

            if ($reserva->estado === 'cancelled') {

                $response = [
                    'error' => 'La reserva ya está cancelada'
                ];

                $status = 400;

            } else {

                /*
                |---------------------------------------------------
                | 1. TRANSACCION SOLO BD
                |---------------------------------------------------
                */
                DB::transaction(function () use ($reserva) {

                    /*
                    | CAMBIAR ESTADO RESERVA
                    */
                    $reserva->estado = 'cancelled';

                    $reserva->save();

                    /*
                    | CANCELAR CONTRATO
                    */
                    $contrato = Contrato::where(
                        'idReserva',
                        $reserva->idReserva
                    )->first();

                    if ($contrato) {

                        $contrato->estado = 'cancelado';

                        $contrato->save();
                    }
                });

                /*
                |---------------------------------------------------
                | 2. BUSCAR COMUNICACION SES
                |---------------------------------------------------
                */
                $comunicacion = ComunicacionSES::where(
                    'idReserva',
                    $reserva->idReserva
                )
                ->where('tipo_comunicacion', 'A')
                ->latest()
                ->first();

                /*
                |---------------------------------------------------
                | 3. ANULAR SES
                |---------------------------------------------------
                */
                if (
                    $comunicacion &&
                    !$comunicacion->anulada &&
                    $comunicacion->codigo_comunicacion
                ) {

                    $resultadoAnulacion = app(
                        SesAnulacionComunicacionService::class
                    )->anular(
                        $comunicacion
                    );

                    logger()->info('RESULTADO ANULACION SES', [
                        'resultado' => $resultadoAnulacion
                    ]);

                    /*
                    |---------------------------------------------------
                    | 4. CONSULTAR COMUNICACION ORIGINAL
                    |---------------------------------------------------
                    */
                    $intentos = 0;
                    $maxIntentos = 10;

                    $anulada = false;

                    while ($intentos < $maxIntentos && !$anulada) {

                        sleep(3);

                        $resultadoConsulta = app(SesConsultaComunicacionService::class)
                            ->consultar($comunicacion);

                        logger()->info('CONSULTA COMUNICACION SES', [
                            'intento' => $intentos,
                            'resultado' => $resultadoConsulta
                        ]);

                        $anulada = filter_var(
                            $resultadoConsulta['anulada'] ?? false,
                            FILTER_VALIDATE_BOOLEAN
                        );

                        $intentos++;
                    }

                    /*
                    |---------------------------------------------------
                    | 5. VERIFICAR SI ESTA ANULADA
                    |---------------------------------------------------
                    */
                    $anulada = filter_var(
                        $resultadoConsulta['anulada'] ?? false,
                        FILTER_VALIDATE_BOOLEAN
                    );

                    if ($anulada) {

                        $comunicacion->anulada = true;

                        $comunicacion->estado_ses = 'ANULADO';

                        $comunicacion->descripcion_estado =
                            'Reserva anulada correctamente en SES';

                        $comunicacion->save();
                    }
                }

                /*
                |---------------------------------------------------
                | 6. EMAIL
                |---------------------------------------------------
                */
                Mail::to($reserva->persona->email)
                    ->send(
                        new ReservaCanceladaMail(
                            $reserva,
                            $reserva->persona
                        )
                    );

                $response = [
                    'success' => true,
                    'message' => 'Reserva rechazada correctamente'
                ];
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            $response = [
                'error' => 'Reserva no encontrada'
            ];

            $status = 404;

        } catch (\Exception $e) {

            logger()->error('ERROR CANCELANDO RESERVA', [
                'error' => $e->getMessage()
            ]);

            $response = [
                'error' => $e->getMessage()
            ];

            $status = 500;
        }

        return response()->json($response, $status);
    }

}
