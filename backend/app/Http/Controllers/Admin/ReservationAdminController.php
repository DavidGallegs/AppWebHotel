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


    /*
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
                    
                    ViajeroParte::create([
                        'idParte' => $parte->idParte,
                        'idPersona' => $persona->idPersona,
                        'rol' => $titular['rol'],
                    ]);
                    
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
    */
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
                        $contrato->estado = 'cancelado';
                        $contrato->save();
                    }

                    // 3. Enviar email de cancelación
                    Mail::to($reserva->persona->email)
                            ->send(new ReservaCanceladaMail(
                                $reserva,
                                $reserva->persona
                            ));
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

}
