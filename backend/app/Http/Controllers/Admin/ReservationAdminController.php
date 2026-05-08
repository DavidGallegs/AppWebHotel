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

                    'titular' => [
                        'nombre' => $reserva->persona->nombre,
                        'apellido1' => $reserva->persona->apellido1,
                        'apellido2' => $reserva->persona->apellido2,
                        'tipoDocumento' => $reserva->persona->tipoDocumento,
                        'numeroDocumento' => $reserva->persona->documento,
                        'telefono' => $reserva->persona->telefono,
                        'correo' => $reserva->persona->email,
                        'direccion' => $reserva->persona->direccion,
                        'codigoPostal' => $reserva->persona->codigoPostal,
                        'nombreMunicipio' => $reserva->persona->nombreMunicipio,
                        'codigoMunicipio' => $reserva->persona->codigoMunicipio,
                        'pais' => $reserva->persona->nacionalidad,
                    ]
                ];
            });
        }

        return response()->json($response, $status);
    }

    public function approveReservation($id)
    {
        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::with('persona')->findOrFail($id);

            // Si ya está aprobada
            if ($reserva->estado === 'approved') {
                $response = [
                    'error' => 'La reserva ya está aprobada'
                ];
                $status = 400;

            } else {

                DB::transaction(function () use ($reserva) {

                    // 1.-Cambiar estado
                    $reserva->estado = 'approved';
                    $reserva->save();

                    // 2. Generar referencia del contrato
                    $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

                    // 3. Crear contrato asociado
                    Contrato::create([
                        'referencia' => $referencia,
                        'idReserva' => $reserva->idReserva,
                        'fechaContrato' => now(), 
                        'estado' => 'activo',
                        'internet' => false,
                        'tipoPago' => null,
                        'fechaPago' => null,
                        'precioTotal' => null
                    ]);

                    // 4.- Creamos un parte asociado al contrato, con estado "pendiente".
                    $parte = Parte::create([
                        'referenciaContrato' => $referencia,
                        'estado' => 'pending',
                        'fechaCreacion' => now(),
                        'fechaEnvio' => null,
                        'createdAt' => now(),
                        'updatedAt' => now()
                    ]);
                    /*
                    ViajeroParte::create([
                        'idParte' => $parte->idParte,
                        'idPersona' => $persona->idPersona,
                        'rol' => $titular['rol'],
                    ]);
                    */
                    // 5.- Enviar email de confirmación
                    Mail::to($reserva->persona->email)
                        ->send(new ReservaConfirmadaMail($reserva));
                });

                $response = [
                    'success' => true,
                    'message' => 'Reserva aprobada correctamente'
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

    public function rejectReservation($id)
    {
        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::with('persona')->findOrFail($id);

            if ($reserva->estado === 'cancelled') {

                $response = [
                    'error' => 'La reserva ya está cancelada'
                ];
                $status = 400;

            } else {

                DB::transaction(function () use ($reserva) {

                    // 1. Cambiar estado a cancelada
                    $reserva->estado = 'cancelled';
                    $reserva->save();

                    // 2. Cancelar contrato si existe
                    $contrato = Contrato::where('idReserva', $reserva->idReserva)->first();

                    if ($contrato) {
                        $contrato->estado = 'cancelled';
                        $contrato->save();
                    }

                    // 3. Enviar email de cancelación
                    Mail::to($reserva->persona->email)
                        ->send(new ReservaCanceladaMail($reserva));
                });

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

            $response = [
                'error' => $e->getMessage()
            ];
            $status = 500;
        }

        return response()->json($response, $status);
    }

    public function resolveRequest(Request $request, $id)
    {
        $request->validate([
            'accion' => 'required|in:accept,reject',
            'tipo'   => 'required|in:mod,cancel'
        ]);

        $accion = $request->accion;
        $tipo = $request->tipo;

        $reserva = Reserva::find($id);

        if (!$reserva) {

            return response()->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | CANCELACIONES
        |--------------------------------------------------------------------------
        */

        if ($tipo === 'cancel') {

            if ($accion === 'accept') {

                $reserva->estado = 'cancelled';
            }

            $reserva->solicitud_cancelacion = 0;

            $reserva->save();

            return response()->json([
                'message' => 'Solicitud de cancelación resuelta.'
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | MODIFICACIONES
        |--------------------------------------------------------------------------
        */

        if ($tipo === 'mod') {

            /*
            |--------------------------------------------------------------------------
            | RECHAZAR
            |--------------------------------------------------------------------------
            */

            if ($accion === 'reject') {

                $reserva->datos_modificacion = null;

                $reserva->save();

                return response()->json([
                    'message' => 'Solicitud rechazada.'
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | ACEPTAR MODIFICACIÓN
            |--------------------------------------------------------------------------
            */

            $datos = json_decode(
                $reserva->datos_modificacion,
                true
            );

            if (!$datos) {

                return response()->json([
                    'error' => 'No existen datos de modificación'
                ], 400);
            }

            /*
            |--------------------------------------------------------------------------
            | COMPROBAR DISPONIBILIDAD
            |--------------------------------------------------------------------------
            */

            $habitacion = ReservaHabitacion::where(
                'idReserva',
                $reserva->idReserva
            )->first();

            $conflicto = Reserva::join(
                    'reserva_habitacion as rh',
                    'reserva.idReserva',
                    '=',
                    'rh.idReserva'
                )
                ->where('rh.idHabitacion', $habitacion->idHabitacion)

                // Excluimos la propia reserva
                ->where('reserva.idReserva', '!=', $reserva->idReserva)

                // Estados válidos
                ->whereIn('reserva.estado', [
                    'pending',
                    'approved',
                    'finished'
                ])

                // Cruce de fechas
                ->where(function ($query) use ($datos) {

                    $query->whereBetween(
                        'reserva.fechaEntrada',
                        [
                            $datos['fechaEntrada'],
                            $datos['fechaSalida']
                        ]
                    )

                    ->orWhereBetween(
                        'reserva.fechaSalida',
                        [
                            $datos['fechaEntrada'],
                            $datos['fechaSalida']
                        ]
                    );
                })

                ->exists();

            if ($conflicto) {

                return response()->json([
                    'error' => 'Las nuevas fechas no están disponibles'
                ], 409);
            }

            /*
            |--------------------------------------------------------------------------
            | ACTUALIZAR RESERVA
            |--------------------------------------------------------------------------
            */

            DB::transaction(function () use (
                $reserva,
                $datos
            ) {

                $reserva->fechaEntrada = $datos['fechaEntrada'];

                $reserva->fechaSalida = $datos['fechaSalida'];

                $reserva->datos_modificacion = null;

                $reserva->save();
            });

            return response()->json([
                'message' => 'Modificación aceptada correctamente.'
            ]);
        }

        return response()->json([
            'error' => 'Operación inválida'
        ], 400);
    }
}
