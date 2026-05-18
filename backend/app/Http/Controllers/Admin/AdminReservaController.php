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
use App\Services\SES\SesAltaReservaService;
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

            if (!in_array($reserva->estado_pago, ['pendiente', 'notificado'])) {

                return response()->json([
                    'error' => 'El pago aún no ha sido notificado'
                ], 400);
            }

            $parte = null;
            $referencia = null;

            DB::transaction(function () use ($reserva, &$parte, &$referencia) {

                /*
                |--------------------------------------------------------------------------
                | 1. CONFIRMAR PAGO
                |--------------------------------------------------------------------------
                */

                $reserva->estado_pago = 'pagado';

                /*
                |--------------------------------------------------------------------------
                | 2. APROBAR RESERVA + CREAR CONTRATO + PARTE
                |--------------------------------------------------------------------------
                */

                if ($reserva->estado !== 'approved') {

                    $reserva->estado = 'approved';

                    $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

                    Contrato::create([
                        'referencia' => $referencia,
                        'idReserva' => $reserva->idReserva,
                        'fechaContrato' => now(),
                        'estado' => 'activo',
                        'internet' => false,
                        'tipoPago' => "TRANF",
                        'fechaPago' => now(),
                        'precioTotal' => null
                    ]);

                    
                }

                if (!$parte){
                    $parte = Parte::create([
                        'referenciaContrato' => $referencia ?? Contrato::where('idReserva', $reserva->idReserva)->value('referencia'),
                        'estado' => 'pending',
                        'fechaCreacion' => now(),
                        'fechaEnvio' => null,
                        'createdAt' => now(),
                        'updatedAt' => now()
                    ]);

                    $viajeroParte = ViajeroParte::create([
                        'idParte' => $parte->idParte,
                        'idPersona' => $reserva->idPersonaTitular,
                        'rol' => 'TI',
                        'parentesco' => null
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | 3. GUARDAR RESERVA
                |--------------------------------------------------------------------------
                */

                $reserva->updatedAt = now();
                $reserva->save();

                /*
                |--------------------------------------------------------------------------
                | 4. EMAIL (mejor dentro o fuera, aquí lo dejo como tú lo tenías)
                |--------------------------------------------------------------------------
                */

                Mail::to($reserva->persona->email)
                    ->send(new ReservaConfirmadaMail($reserva));
            });

            /*
            |--------------------------------------------------------------------------
            | 5. ENVIAR A SES (FUERA DE TRANSACCIÓN)
            |--------------------------------------------------------------------------
            */

        

            $estado = null;
            if ($parte instanceof \App\Models\Parte) {
                $estado = "entra";
                app(SesAltaReservaService::class)
                    ->enviarParte($parte);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago confirmado y reserva aprobada correctamente',
                'parte' => $parte,
                'estado' => $estado
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'error' => 'Reserva no encontrada'
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
