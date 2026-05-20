<?php

namespace App\Http\Controllers;
use App\Models\Persona;
use App\Models\Reserva;
use App\Models\Contrato;
use App\Models\Parte;
use App\Models\ViajeroParte;
use App\Models\Establecimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use App\Rules\DniValido;
use Illuminate\Support\Facades\DB;
use App\Models\ReservaHabitacion;
use App\Models\BloqueoFecha;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudModificacionReservaMail;
use App\Mail\ReservaCanceladaMail;
use App\Mail\ReservaPendientePagoMail;


class ReservaController extends Controller
{
    /*
    | METODO PARA CREAR RESERVA DESDE FRONTEND
    */
    public function crearReserva(Request $request)
    {
        /*
        | 1. EXTRAER Y UNIFICAR DATOS DE TITULAR Y ACOMPAÑANTES
        */
        $titular = $request->input('titular');

        $titular['nombre'] = Str::ucfirst(Str::lower(trim($titular['nombre'])));
        $titular['apellido1'] = Str::ucfirst(Str::lower(trim($titular['apellido1'])));
        $titular['apellido2'] = $titular['apellido2']
            ? Str::ucfirst(Str::lower(trim($titular['apellido2'])))
            : null;
        $titular['numeroDocumento'] = strtoupper(trim($titular['numeroDocumento']));
        $titular['cp'] = $titular['codigoPostal'];
        $titular['correo'] = strtolower(trim($titular['correo'] ?? ''));


        /*
        |2. VALIDACION DE DATOS DE TITULAR 
        */
        $validated = validator($titular, [
            'nombre' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
            'apellido1' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
            'apellido2' => ['nullable','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],

            'fechaNacimiento' => ['required','date','before:today'],

            'pais' => ['nullable','string','max:3'],

            'direccion' => ['required','string','max:255'],

            'codigoMunicipio' => ['nullable','string','max:10'],
            'nombreMunicipio' => ['nullable','string','max:100'],
            'localidad' => ['nullable','string','max:100'],

            'cp' => ['required','string','max:10'],

            'telefono' => ['nullable','string','max:20'],
            'correo' => ['nullable','email','max:255'],

            'tipoDocumento' => ['nullable','in:DNI,NIE,PASAPORTE'],
            'numeroDocumento' => ['required','string','max:15', new DniValido],
            'soporteDocumento' => ['nullable','string','max:9'],

        ])->validate();

        /*
        |3. CREAR O ACTUALIZAR REGISTRO EN PERSONA PARA EL TITULAR
        */
        $persona = Persona::updateOrCreate(
            [
                'email' => $validated['correo'],
            ],
            [
                'nombre' => $validated['nombre'],
                'apellido1' => $validated['apellido1'],
                'apellido2' => $validated['apellido2'] ?? null,
                'fechaNacimiento' => $validated['fechaNacimiento'],
                'nacionalidad' => $validated['pais'] ?? null,
                'direccion' => $validated['direccion'],
                'codigoMunicipio' => $validated['codigoMunicipio'] ?? null,
                'nombreMunicipio' => $validated['nombreMunicipio'] ?? null,
                'localidad' => $validated['localidad'] ?? null,
                'cp' => $validated['cp'],
                'email' => $validated['correo'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'tipoDocumento' => $validated['tipoDocumento'] ?? null,
                'documento' => $validated['numeroDocumento'],
                'soporteDocumento' => $validated['soporteDocumento'] ?? null,
            ]
        );
        
        /*
        |4. CREAR RESERVA ASOCIADA AL TITULAR
        */
        $establecimiento = Establecimiento::first();

        $reserva = Reserva::create([
            'idPersonaTitular' => $persona->idPersona,
            'codigoEstablecimiento' => $establecimiento->codigoEstablecimiento,
            'fechaEntrada' => $request->input('fechaEntrada'),
            'fechaSalida' => $request->input('fechaSalida'),
            'estado' => 'pending',
            'createdAt' => now(),
            'updatedAt' => now(),
        ]);

        /*
        |5. ASOCIAR HABITACION Y NUMERO DE PERSONAS A LA RESERVA CREADA 
        */
        ReservaHabitacion::create([
            'idReserva' => $reserva->idReserva,
            'idHabitacion' => (int) $request->input('habitacion'),
            'numPersonas' => $request->input('numPersonas'),
        ]);
        
        /*
        |6. ENVIAR EMAIL
        */
        $precio = 150; 
        Mail::to($persona->email)->send(
            new ReservaPendientePagoMail(
                $reserva,
                $persona,
                $precio
            )
        );
        return response()->json([
            'success' => true,
            'date' => $titular,
        ]);
    }


    /*
    |FUNCION PARA OBTENER DETALLES DE UNA RESERVA ESPECIFICA, INCLUYENDO DATOS DEL CONTRATO SI EXISTE
    */
    public function show($id)
    {
        $reserva = Reserva::with('contrato')->find($id);

        $data = [];
        $status = 200;

        if (!$reserva) {
            $data = [
                'message' => 'Reserva no encontrada'
            ];
            $status = 404;
        } else {
            $data = [
                'numPersonas' => $reserva->numPersonas,
                'numHabitaciones' => $reserva->numHabitaciones,
                'fechaEntrada' => $reserva->fechaEntrada,
                'fechaSalida' => $reserva->fechaSalida,
                'status' => $reserva->estado
            ];

            if ($reserva->contrato) {
                $data['contrato'] = [
                    'fechaContrato' => $reserva->contrato->fechaContrato,
                    'internet' => $reserva->contrato->internet,
                    'tipoPago' => $reserva->contrato->tipoPago,
                    'fechaPago' => $reserva->contrato->fechaPago,
                    'precioTotal' => $reserva->contrato->precioTotal,
                    'status' => $reserva->contrato->estado
                ];
            }
        }
        return response()->json($data, $status);
    }

    public function solicitarCancelacion($id)
    {
        try {

            $reserva = Reserva::findOrFail($id);

            if ($reserva->estado !== 'approved') {
                return response()->json([
                    'error' => 'Solo reservas aprobadas'
                ], 400);
            }

            if ($reserva->solicitud_cancelacion) {
                return response()->json([
                    'error' => 'Ya existe una solicitud'
                ], 400);
            }

            $reserva->solicitud_cancelacion = true;
            $reserva->save();

            return response()->json([
                'success' => true,
                'message' => 'Solicitud enviada'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancelarReserva($id)
    {
        $response = null;
        $status = 200;

        try {
            $reserva = Reserva::findOrFail($id);

            if ($reserva->estado === 'cancelled') {
                $response = [
                    'error' => 'La reserva ya está cancelada'
                ];
                $status = 400;

            } elseif ($reserva->estado !== 'pending') {
                $response = [
                    'error' => 'Solo las reservas pendientes pueden cancelarse directamente'
                ];
                $status = 400;

            } else {
                DB::transaction(function () use ($reserva) {

                    $reserva->estado = 'cancelled';
                    $reserva->save();
                    $contrato = Contrato::where('idReserva', $reserva->idReserva)->first();

                    if ($contrato) {
                        $contrato->estado = 'cancelled';
                        $contrato->save();
                    }
                });

                $persona = Persona::find($reserva->idPersonaTitular);

                if ($persona && $persona->email) {
                    Mail::to($persona->email)->send(
                        new ReservaCanceladaMail($reserva, $persona)
                    );
                }

                $response = [
                    'success' => true,
                    'message' => 'Reserva cancelada correctamente'
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

    public function update(Request $request, $id)
    {
        $status = 200;
        $response = [];
        $reserva = Reserva::with('persona')->find($id);

        if (!$reserva) {
            $status = 404;
            $response = [
                'error' => 'Reserva no encontrada'
            ];
        } else {
            /*
            | ACTUALIZAR DATOS DE LA RESERVA 
            */
            $reserva->fechaEntrada = $request->fechaEntrada;
            $reserva->fechaSalida = $request->fechaSalida;

            if ($request->has('idHabitacion')) {
                $reserva->idHabitacion = $request->idHabitacion;
            }
            $reserva->save();
            /*
            | ACTUALIZAR DATOS DEL TITULAR SI SE ENVIAN EN LA SOLICITUD
            */
            if ($request->has('titular') && $reserva->persona) {
                $reserva->persona->update([
                    'nombre' => $request->titular['nombre'] ?? $reserva->persona->nombre,
                    'apellidos' => $request->titular['apellidos'] ?? $reserva->persona->apellidos,
                    'dni' => $request->titular['dni'] ?? $reserva->persona->dni,
                    'telefono' => $request->titular['telefono'] ?? $reserva->persona->telefono,
                    'email' => $request->titular['email'] ?? $reserva->persona->email,
                ]);
            }

            $response = [
                "message" => "Reserva actualizada con éxito"
            ];
        }
        return response()->json($response, $status);
    }
    
    /*
    | FUNCION PARA OBTENER LOS DIAS OCUPADOS DE UNA HABITACION EN UN RANGO DE FECHAS, INCLUYENDO RESERVAS APROBADAS Y BLOQUEOS MANUALES
    */
    public function ocupacion(Request $request)
    {
        $habitacionId = $request->query('habitacion');
        $excludeReservaId = $request->query('exclude_reserva');

        $diasOcupados = [];

        if ($habitacionId) {
            $query = Reserva::join(
                    'reserva_habitacion as rh',
                    'reserva.idReserva',
                    '=',
                    'rh.idReserva'
                )
                ->where('rh.idHabitacion', $habitacionId)

   
                ->whereIn('reserva.estado', [
                    'pending',
                    'approved',
                    'finished'
                ]);

            if ($excludeReservaId) {
                $query->where('reserva.idReserva', '!=', $excludeReservaId);
            }

            $reservas = $query
                ->select(
                    'reserva.fechaEntrada',
                    'reserva.fechaSalida'
                )
                ->get();

            foreach ($reservas as $reserva) {
                $start = new \DateTime($reserva->fechaEntrada);
                $end = new \DateTime($reserva->fechaSalida);

                while ($start <= $end) {
                    $diasOcupados[] = $start->format('Y-m-d');
                    $start->modify('+1 day');
                }
            }
            /*
            | BLOQUEOS MANUALES: OBTENER LOS BLOQUEOS DE FECHAS ASOCIADOS A LA HABITACION, INCLUYENDO 
            | LOS QUE NO TIENEN ID DE HABITACION 
            */
            $bloqueos = BloqueoFecha::where('idHabitacion', $habitacionId)
                ->orWhere(function ($query) {
                    $query->whereNull('idHabitacion');
                })
                ->get();

            foreach ($bloqueos as $bloqueo) {
                $start = new \DateTime($bloqueo->fechaInicio);
                $end = new \DateTime($bloqueo->fechaFin);
                while ($start <= $end) {
                    $diasOcupados[] = $start->format('Y-m-d');
                    $start->modify('+1 day');
                }
            }
            $diasOcupados = array_values(array_unique($diasOcupados));
        }
        return response()->json([
            'diasOcupados' => $diasOcupados
        ]);
    }

    /*
    |FUNCION PARA SOLICITAR MODIFICACION DE RESERVA: SI LA RESERVA ESTA PENDING, SE MODIFICA DIRECTAMENTE. 
    |SI ESTA APPROVED, SE CREA UNA SOLICITUD DE MODIFICACION QUE EL ADMIN DEBE APROBAR. 
    |SI YA EXISTE UNA SOLICITUD PENDIENTE, SE RECHAZA LA NUEVA SOLICITUD
    */
    public function solicitarModificacion(Request $request, $id)
    {
        $response = null;
        $status = 200;

        try {
            $reserva = Reserva::with('persona')->findOrFail($id);

            if (in_array($reserva->estado, ['cancelled', 'finished'])) {
                $response = [
                    'error' => 'La reserva no puede modificarse'
                ];
                $status = 400;

            } else {
                $datos = $request->input('datos');
                if (!$datos) {
                    $response = [
                        'error' => 'No se enviaron datos de modificación'
                    ];

                    $status = 400;
                } else {
                    DB::transaction(function () use ($reserva, $datos) {
                        $titular = $datos['titular'] ?? null;
                        unset($datos['titular']);

                        /*
                        | RESERVA PENDING -> MODIFICACION DIRECTA
                        */
                        if ($reserva->estado === 'pending') {
                            $reserva->fechaEntrada = $datos['fechaEntrada'] ?? $reserva->fechaEntrada;
                            $reserva->fechaSalida  = $datos['fechaSalida'] ?? $reserva->fechaSalida;

                            if ($titular) {
                                $reserva->persona->update($titular);
                            }

                            if (isset($datos['idHabitacion'], $datos['numPersonas'])) {

                                DB::table('reserva_habitacion')
                                    ->where('idReserva', $reserva->idReserva)
                                    ->where('idHabitacion', $datos['idHabitacion'])
                                    ->update([
                                        'numPersonas' => $datos['numPersonas']
                                    ]);
                            }
                        /*
                        | RESERVA APROBADA -> SOLICITUD MODIFICACION
                        */
                        } else {
                            if ($reserva->solicitud_modificacion) {
                                throw new \Exception('Ya existe una solicitud de modificación pendiente');
                            }
                            $reserva->solicitud_modificacion = 1;

                            $reserva->datos_modificacion = [
                                'reserva' => [
                                    'fechaEntrada' => $datos['fechaEntrada'] ?? null,
                                    'fechaSalida'  => $datos['fechaSalida'] ?? null,
                                    'idHabitacion' => $datos['idHabitacion'] ?? null,
                                    'numPersonas'  => $datos['numPersonas'] ?? null,
                                ],
                                'titular' => $titular
                            ];
                        }
                        $reserva->updatedAt = now();
                        $reserva->save();
                    });
                    $response = [
                        'success' => true,
                        'message' => $reserva->estado === 'pending'
                            ? 'Reserva modificada correctamente'
                            : 'Solicitud de modificación enviada correctamente'
                    ];
                }
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

    /*
    | FUNCION PARA SOLICITAR CANCELACION DE RESERVA: SI LA RESERVA ESTA PENDING, SE CANCELA DIRECTAMENTE.
    */
    public function requestCancellation($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }
        $reserva->solicitud_cancelacion = 1;
        $reserva->save();

        return response()->json([
            'message' => 'Solicitud de cancelación registrada correctamente.'
        ]);
    }

    /*
    | FUNCION PARA OBETNER LA LISTA DE RESERVAS DE UN USUARIO AUTENTICADO, INCLUYENDO DATOS DEL TITULAR 
    | Y DE LA HABITACION ASOCIADA A CADA RESERVA
    */
    public function index(Request $request)
    {
        $user = $request->user();
        $response = [];
        $status = 200;

        if (!$user) {
            $response = [
                'error' => 'No autenticado'
            ];
            $status = 401;
        } else {
            $idPersona = $user->idPersona;
            $reservas = Reserva::with([
                    'persona',
                    'habitaciones'
                ])
                ->where('idPersonaTitular', $idPersona)
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
                        'fechaNacimiento' => $reserva->persona->fechaNacimiento,
                        'tipoDocumento' => $reserva->persona->tipoDocumento,
                        'numeroDocumento' => $reserva->persona->documento,
                        'soporteDocumento' => $reserva->persona->soporteDocumento,
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

    /*
    | FUNCION PARA NOTIFICAR PAGO DE UNA RESERVA: SOLO SE PERMITE NOTIFICAR SI LA RESERVA ESTA PENDIENTE DE PAGO.
    */
    public function notificarPago($id)
    {
        try {
            $reserva = Reserva::findOrFail($id);

            if ($reserva->estado_pago !== 'pendiente') {

                return response()->json([
                    'error' => 'La reserva no está pendiente de pago'
                ], 400);
            }
            /*
            | ACTUALIZAR ESTADO PAGO
            */
            $reserva->estado_pago = 'notificado';
            $reserva->updatedAt = now();
            $reserva->save();
            return response()->json([
                'success' => true,
                'message' => 'Pago notificado correctamente'
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

    public function solicitarDevolucion($id)
    {
        $response = null;
        $status = 200;

        try {
            $reserva = Reserva::findOrFail($id);

            if ($reserva->estado_pago !== 'pagado') {
                $response = [
                    'error' => 'Solo se pueden solicitar devoluciones de reservas pagadas'
                ];
                $status = 400;
            } else {
                /*
                | ACTUALIZAR ESTADO DE PAGO A DEVOLUCION_SOLICITADA Y MARCAR SOLICITUD DE CANCELACION PARA QUE 
                |EL ADMIN PUEDA REVISAR LA SOLICITUD DE DEVOLUCION
                */
                $reserva->estado_pago = 'devolucion_solicitada';
                $reserva->solicitud_cancelacion = 1;
                $reserva->updatedAt = now();
                $reserva->save();
                $response = [
                    'success' => true,
                    'message' => 'Solicitud de devolución enviada correctamente'
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