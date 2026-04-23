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
        $titular['apellido2'] = trim($titular['apellido2'] );
        $titular['documento'] = strtoupper(trim($titular['numeroDocumento']));
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
            'documento' => ['required','string','max:15', new DniValido],
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
                'documento' => $validated['documento'],
                'soporteDocumento' => $validated['soporteDocumento'] ?? null,
            ]
        );

        // 5. Crear reserva (solo titular)
        $establecimiento = Establecimiento::first();

       

        $reserva = Reserva::create([
            'idPersonaTitular' => $persona->idPersona,
            'codigoEstablecimiento' => $establecimiento->codigo,
            'numPersonas' => $request->input('numPersonas'),
            'numHabitaciones' => $request->input('numHabitaciones', 1),
            'fechaEntrada' => $request->input('fechaEntrada'),
            'fechaSalida' => $request->input('fechaSalida'),
            'estado' => 'pendiente',
            'createdAt' => now(),
            'updatedAt' => now(),
        ]);


        //.- Generamos la referencia del contrato
        $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

        //.- Creamos un contrato asociado a la reserva.
        Contrato::create([
            'referencia' => $referencia, 
            'idReserva' => $reserva->idReserva,
            'fechaContrato' => now(),
            'fechaEntrada' => $request->fechaEntrada,
            'fechaSalida' => $request->fechaSalida,
            'internet' => false,
            'tipoPago' => null, 
            'fechaPago' => null,
            'precioTotal' => null
        ]);

        //.- Creamos un parte asociado al contrato, con estado "pendiente".
        $parte = Parte::create([
            'referenciaContrato' => $referencia,
            'estado' => 'pendiente',
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




        return response()->json([
            'success' => true,
            'date' => $titular,
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Obtener persona asociada al usuario
        $idPersona = $user->idPersona;

        // Obtener reservas SOLO del usuario autenticado
        $reservas = Reserva::where('idPersonaTitular', $idPersona)
            ->join('persona', 'reserva.idPersonaTitular', '=', 'persona.idPersona')
            ->select(
                'reserva.idReserva as id',
                'persona.nombre as nombre',
                'persona.apellido1 as apellido1',
                'reserva.fechaEntrada as fechaEntrada',
                'reserva.fechaSalida as fechaSalida',
                'reserva.estado as status'
            )
            ->orderBy('reserva.fechaEntrada', 'desc')
            ->get();

        // Normalizar status para frontend (MUY IMPORTANTE)
        $reservas->transform(function ($reserva) {

            $map = [
                'pendiente' => 'pending',
                'aprobada'  => 'approved',
                'cancelada' => 'cancelled',
                'finalizada'=> 'finished',
            ];

            $reserva->status = $map[$reserva->status];

            return $reserva;
        });

        return response()->json($reservas);
    }

}
