<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

use App\Models\Persona;
use App\Models\Reserva;
use App\Models\Contrato;
use App\Models\Parte;
use App\Models\ViajeroParte;
use App\Models\ReservaHabitacion;
use App\Models\Establecimiento;

class CheckInController extends Controller
{
    public function walkIn(Request $request)
    {
        try {

            $request->validate([
                'idHabitacion' => 'required|integer',
                'fecha_entrada' => 'required|date',
                'fecha_salida' => 'required|date|after:fecha_entrada',
                'numPersonas' => 'required|integer|min:1',
                'viajeros' => 'required|array|min:1',
            ]);

            $reservaCreada = null;

            DB::transaction(function () use ($request, &$reservaCreada) {

                /*
                |-----------------------------
                | TITULAR
                |-----------------------------
                */
                $titularData = $request->viajeros[0];

                $titular = Persona::create([
                    'nombre' => $titularData['nombre'],
                    'apellido1' => $titularData['apellido1'] ?? null,
                    'apellido2' => $titularData['apellido2'] ?? null,
                    'fechaNacimiento' => $titularData['fechaNacimiento'] ?? null,

                    'pais' => $titularData['pais'] ?? null,
                    'codigoMunicipio' => $titularData['codigoMunicipio'] ?? null,
                    'nombreMunicipio' => $titularData['nombreMunicipio'] ?? null,

                    'direccion' => $titularData['direccion'] ?? null,
                    'cp' => $titularData['codigoPostal'] ?? null,

                    'tipoDocumento' => $titularData['tipoDocumento'] ?? null,
                    'documento' => $titularData['numeroDocumento'] ?? null,
                    'soporteDocumento' => $titularData['soporteDocumento'] ?? null,
                ]);

                /*
                |-----------------------------
                | RESERVA
                |-----------------------------
                */
                $establecimiento = Establecimiento::first();

                $reserva = Reserva::create([
                    'idPersonaTitular' => $titular->idPersona,
                    'codigoEstablecimiento' => $establecimiento->codigoEstablecimiento,
                    'fechaEntrada' => $request->fecha_entrada,
                    'fechaSalida' => $request->fecha_salida,
                    'estado' => 'finished',
                    'estado_pago' => 'pagado',
                ]);

                /*
                |-----------------------------
                | CONTRATO
                |-----------------------------
                */
                $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

                $contrato = Contrato::create([
                    'referencia' => $referencia,
                    'idReserva' => $reserva->idReserva,
                    'fechaContrato' => now(),
                    'estado' => 'activo',
                    'internet' => false,
                    'tipoPago' => 'recepcion',
                    'fechaPago' => now(),
                    'precioTotal' => null,
                ]);

                /*
                |-----------------------------
                | HABITACIÓN
                |-----------------------------
                */
                ReservaHabitacion::create([
                    'idReserva' => $reserva->idReserva,
                    'idHabitacion' => $request->idHabitacion,
                    'numPersonas' => $request->numPersonas,
                ]);

                /*
                |-----------------------------
                | PARTE
                |-----------------------------
                */
                $parte = Parte::create([
                    'referenciaContrato' => $contrato->referencia,
                    'estado' => 'pendiente',
                ]);

                /*
                |-----------------------------
                | VIAJEROS
                |-----------------------------
                */
                foreach ($request->viajeros as $index => $viajeroData) {

                    if ($index === 0) {
                        $persona = $titular;
                    } else {
                        $persona = Persona::create([
                            'nombre' => $viajeroData['nombre'],
                            'apellido1' => $viajeroData['apellido1'] ?? null,
                            'apellido2' => $viajeroData['apellido2'] ?? null,
                            'fechaNacimiento' => $viajeroData['fechaNacimiento'] ?? null,

                            'pais' => $viajeroData['pais'] ?? null,
                            'codigoMunicipio' => $viajeroData['codigoMunicipio'] ?? null,
                            'nombreMunicipio' => $viajeroData['nombreMunicipio'] ?? null,

                            'direccion' => $viajeroData['direccion'] ?? null,
                            'cp' => $viajeroData['codigoPostal'] ?? null,

                            'tipoDocumento' => $viajeroData['tipoDocumento'] ?? null,
                            'documento' => $viajeroData['numeroDocumento'] ?? null,
                            'soporteDocumento' => $viajeroData['soporteDocumento'] ?? null,
                        ]);
                    }

                    /*
                    |-----------------------------
                    | RELACIÓN VIAJERO - PARTE
                    |-----------------------------
                    */
                    ViajeroParte::create([
                        'idParte' => $parte->idParte,
                        'idPersona' => $persona->idPersona,
                        'rol' => $index === 0 ? 'TI' : 'VI',
                        'parentesco' => $viajeroData['parentesco'] ?? null,
                    ]);
                }

                $reservaCreada = $reserva;
            });

            return response()->json([
                'success' => true,
                'message' => 'Walk-in creado correctamente',
                'reserva' => $reservaCreada
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
