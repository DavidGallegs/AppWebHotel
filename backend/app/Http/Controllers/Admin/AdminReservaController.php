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

use App\Models\ComunicacionSES;
use App\Services\SES\SesConsultaLoteService;

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

            if (!in_array($reserva->estado_pago, ['pendiente', 'notificado'])) {

                return response()->json([
                    'error' => 'El pago aún no ha sido notificado'
                ], 400);
            }

            $parte = null;
            $referencia = null;

            DB::transaction(function () use ($reserva, &$parte, &$referencia) {

                /*
                | 1. CONFIRMAR PAGO
                */
                $reserva->estado_pago = 'pagado';
                /*
                | 2. APROBAR RESERVA + CREAR CONTRATO + PARTE
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
                        'tipoPago' => "TRANS",
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
                | 3. GUARDAR RESERVA
                */
                $reserva->updatedAt = now();
                $reserva->save();

                /*
                | 4. EMAIL
                */
                Mail::to($reserva->persona->email)
                    ->send(new ReservaConfirmadaMail($reserva));
            });

            /*
            | 5. ENVIAR A SES 
            */
            $estado = null;
            if ($parte instanceof \App\Models\Parte) {
                
                // 1. Llamamos al servicio
                $sesResponse = app(SesAltaReservaService::class)->enviarParte($parte);

                // 2. CHIVATO: Guardamos la respuesta exacta en los logs de AWS
                logger()->info('=== RESPUESTA CRÍTICA DEL SES ===', [
                    'id_parte' => $parte->idParte,
                    'respuesta_completa' => $sesResponse
                ]);

                // 3. Si NO está OK, frenamos y devolvemos el error a la pantalla
                if (!isset($sesResponse['ok']) || !$sesResponse['ok']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reserva guardada en BD local, pero falló la comunicación con el SES.',
                        'error_ses' => $sesResponse
                    ], 500);
                }

                // 4. Si todo va bien, continúa con tu lógica normal...
                if ($sesResponse['ok']) {
                    sleep(5); 
                    $comunicacion = ComunicacionSES::where('codigo_lote', $sesResponse['lote'])->first();

                    if ($comunicacion) {
                        $intentos = 0;
                        $resultadoConsulta = null;

                        while ($intentos < 5) {
                            $resultadoConsulta = app(SesConsultaLoteService::class)->consultarLote($comunicacion);
                            if (($resultadoConsulta['codigo_estado'] ?? null) != 5) {
                                break;
                            }
                            sleep(3); 
                            $intentos++;
                        }
                        logger()->info('RESULTADO CONSULTA LOTE', ['resultado' => $resultadoConsulta]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago confirmado, reserva aprobada y SES notificado',
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

    public function resolve(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        $validated = $request->validate([
            'accion' => 'required|in:accept,reject',
            'tipo' => 'required|in:mod,cancel',
        ]);

        if ($validated['tipo'] === 'mod') {

            if (
                $validated['accion'] === 'accept' &&
                !empty($reserva->datos_modificacion)
            ) {

                $datos = json_decode($reserva->datos_modificacion, true);

                // ======================
                // TITULAR
                // ======================
                if (!empty($datos['titular']['numeroDocumento'])) {

                    $persona = Persona::updateOrCreate(
                        [
                            'documento' => $datos['titular']['numeroDocumento']
                        ],
                        [
                            'nombre' => $datos['titular']['nombre'] ?? null,
                            'apellido1' => $datos['titular']['apellido1'] ?? null,
                            'apellido2' => $datos['titular']['apellido2'] ?? null,
                            'email' => $datos['titular']['correo'] ?? null,
                            'telefono' => $datos['titular']['telefono'] ?? null,
                            'tipoDocumento' => $datos['titular']['tipoDocumento'] ?? null,
                            'nacionalidad' => $datos['titular']['pais'] ?? null,
                        ]
                    );

                    $reserva->idPersonaTitular = $persona->idPersona;
                }

                // ======================
                // FECHAS
                // ======================
                if (!empty($datos['fechaEntrada'])) {
                    $reserva->fechaEntrada = $datos['fechaEntrada'];
                }

                if (!empty($datos['fechaSalida'])) {
                    $reserva->fechaSalida = $datos['fechaSalida'];
                }

                // ======================
                // HABITACIÓN + PERSONAS (PIVOT)
                // ======================
                if (!empty($datos['idHabitacion']) && !empty($datos['numPersonas'])) {

                    $reserva->habitaciones()->sync([
                        (int) $datos['idHabitacion'] => [
                            'numPersonas' => $datos['numPersonas']
                        ]
                    ]);
                }
            }

            // limpiar SIEMPRE
            $reserva->datos_modificacion = null;
            $reserva->solicitud_modificacion = 0;

            $reserva->save();
        }

        elseif ($validated['tipo'] === 'cancel') {

            if ($validated['accion'] === 'accept') {
                $reserva->estado = 'cancelled';
            }

            $reserva->solicitud_cancelacion = 0;
            $reserva->save();
        }

        return response()->json([
            'success' => true
        ], 200);
    }
}
