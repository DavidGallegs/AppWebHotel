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





class ReservaController extends Controller
{
    // Metodo para recibir la reserva desde el frontend, validar los datos, crear o actualizar las personas en la base de datos.
    public function crearReserva(Request $request)
    {
        // 1. Extraer titular
        $titular = $request->input('titular');

        // 2. Normalización básica
        $titular['nombre'] = trim($titular['nombre']);
        $titular['apellido1'] = trim($titular['apellido1']);
        $titular['apellido2'] = trim($titular['apellido2'] ?? null);
        $titular['numeroDocumento'] = strtoupper(trim($titular['numeroDocumento']));
        $titular['cp'] = $titular['codigoPostal'];
        $titular['correo'] = strtolower(trim($titular['correo']));


        // 3. Validación
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

        // 4. Upsert persona
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
        
        // 5. Crear reserva (solo titular)
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

        
        // 6. Asociar habitaciones a la reserva (si se envían)
        ReservaHabitacion::create([
            'idReserva' => $reserva->idReserva,
            'idHabitacion' => (int) $request->input('habitacion'),
            'numPersonas' => $request->input('numPersonas'),
        ]);
        
        /*
        //.- Generamos la referencia del contrato
        $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

        //.- Creamos un contrato asociado a la reserva.
        Contrato::create([
            'referencia' => $referencia, 
            'idReserva' => $reserva->idReserva,
            'fechaContrato' => $request->input('fechaContrato'),
            'estado' => 'activo',
            'internet' => false,
            'tipoPago' => null, 
            'fechaPago' => null,
            'precioTotal' => null
        ]);

        //.- Creamos un parte asociado al contrato, con estado "pendiente".
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

        */


        return response()->json([
            'success' => true,
            'date' => $titular,
        ]);
    }

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

            // Datos base
            $data = [
                'numPersonas' => $reserva->numPersonas,
                'numHabitaciones' => $reserva->numHabitaciones,
                'fechaEntrada' => $reserva->fechaEntrada,
                'fechaSalida' => $reserva->fechaSalida,
                'estado' => $reserva->estado
            ];

            // Si tiene contrato
            if ($reserva->contrato) {
                $data['contrato'] = [
                    'fechaContrato' => $reserva->contrato->fechaContrato,
                    'internet' => $reserva->contrato->internet,
                    'tipoPago' => $reserva->contrato->tipoPago,
                    'fechaPago' => $reserva->contrato->fechaPago,
                    'precioTotal' => $reserva->contrato->precioTotal,
                    'estado' => $reserva->contrato->estado
                ];
            }
        }

        return response()->json($data, $status);
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
            } else {

                DB::transaction(function () use ($reserva) {

                    // Cancelar reserva
                    $reserva->estado = 'cancelled';
                    $reserva->save();

                    // Cancelar contrato si existe
                    $contrato = Contrato::where('idReserva', $reserva->idReserva)->first();

                    if ($contrato) {
                        $contrato->estado = 'cancelled';
                        $contrato->save();
                    }
                });

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

            // --- ACTUALIZAR RESERVA ---
            $reserva->fechaEntrada = $request->fechaEntrada;
            $reserva->fechaSalida = $request->fechaSalida;

            if ($request->has('idHabitacion')) {
                $reserva->idHabitacion = $request->idHabitacion;
            }

            $reserva->save();

            // --- ACTUALIZAR TITULAR CON RELACIÓN ---
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

    public function ocupacion(Request $request)
    {
        $habitacionId = $request->query('habitacion');

        $diasOcupados = [];

        if ($habitacionId) {

            $reservas = Reserva::join('reserva_habitacion as rh', 'reserva.idReserva', '=', 'rh.idReserva')
                ->where('rh.idHabitacion', $habitacionId)
                ->where('reserva.estado', '!=', 'cancelled')
                ->select('reserva.fechaEntrada', 'reserva.fechaSalida')
                ->get();

            foreach ($reservas as $reserva) {

                $start = new \DateTime($reserva->fechaEntrada);
                $end = new \DateTime($reserva->fechaSalida);

                while ($start <= $end) {
                    $diasOcupados[] = $start->format('Y-m-d');
                    $start->modify('+1 day');
                }
            }

            $diasOcupados = array_values(array_unique($diasOcupados));
        }

        $response = [
            'diasOcupados' => $diasOcupados
        ];

        if (!$habitacionId) {
            $response = [
                'message' => 'Falta el parámetro habitacion',
                'diasOcupados' => []
            ];
        }

        return response()->json($response);
    }

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

}