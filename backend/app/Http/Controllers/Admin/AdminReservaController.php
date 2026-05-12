<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reserva;
use App\Models\Contrato;
use App\Models\Parte;
use App\Models\ViajeroParte;
use App\Models\Persona;
use App\Models\Establecimiento;
use Illuminate\Support\Str;


use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservaConfirmadaMail;

class AdminReservaController extends Controller
{
    public function confirmarPago($id)
    {
        $response = null;
        $status = 200;

        try {

            $reserva = Reserva::with('persona')->findOrFail($id);

            /*
            |--------------------------------------------------------------------------
            | VALIDACIÓN PAGO
            |--------------------------------------------------------------------------
            */

            if ($reserva->estado_pago !== 'notificado') {

                $response = [
                    'error' => 'El pago aún no ha sido notificado'
                ];

                $status = 400;

            } else {

                DB::transaction(function () use ($reserva) {

                    /*
                    |--------------------------------------------------------------------------
                    | 1. CONFIRMAR PAGO
                    |--------------------------------------------------------------------------
                    */

                    $reserva->estado_pago = 'pagado';

                    /*
                    |--------------------------------------------------------------------------
                    | 2. APROBAR RESERVA
                    |--------------------------------------------------------------------------
                    */

                    if ($reserva->estado !== 'approved') {

                        $reserva->estado = 'approved';

                        /*
                        |--------------------------------------------------------------------------
                        | 3. CREAR CONTRATO
                        |--------------------------------------------------------------------------
                        */

                        $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

                        Contrato::create([
                            'referencia' => $referencia,
                            'idReserva' => $reserva->idReserva,
                            'fechaContrato' => now(),
                            'estado' => 'activo',
                            'internet' => false,
                            'tipoPago' => null,
                            'fechaPago' => now(),
                            'precioTotal' => null
                        ]);

                        /*
                        |--------------------------------------------------------------------------
                        | 4. CREAR PARTE
                        |--------------------------------------------------------------------------
                        */

                        Parte::create([
                            'referenciaContrato' => $referencia,
                            'estado' => 'pending',
                            'fechaCreacion' => now(),
                            'fechaEnvio' => null,
                            'createdAt' => now(),
                            'updatedAt' => now()
                        ]);

                        /*
                        |--------------------------------------------------------------------------
                        | 5. EMAIL AL CLIENTE
                        |--------------------------------------------------------------------------
                        */

                        Mail::to($reserva->persona->email)
                            ->send(new ReservaConfirmadaMail($reserva));
                    }

                    $reserva->updatedAt = now();
                    $reserva->save();
                });

                $response = [
                    'success' => true,
                    'message' => 'Pago confirmado y reserva aprobada correctamente'
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
