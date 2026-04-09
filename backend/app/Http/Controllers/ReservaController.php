<?php

namespace App\Http\Controllers;
use App\Models\Persona;
use App\Models\Reserva;
use App\Models\Contrato;
use App\Models\Establecimiento;
use App\Models\Parte;
use App\Models\ViajeroParte;
use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use App\Rules\DniValido;

use App\Mail\ReservaConfirmadaMail;
use Illuminate\Support\Facades\Mail;


class ReservaController extends Controller
{
    // Método para recibir la reserva
    public function crear(Request $request)
    {
        // 1. Unificar viajeros (titular + acompañantes)
        $viajeros = [];

        $viajeros[] = $request->input('titular');

        foreach ($request->input('acompanantes', []) as $acompanante) {
            $viajeros[] = $acompanante;
        }


        $validatedViajeros = [];
        // 2. Validación
        foreach ($viajeros as $index => $viajero) {

            // Normalización de datos
            $viajero['nombre'] = trim($viajero['nombre']);
            $viajero['apellido1'] = trim($viajero['apellido1']);
            $viajero['apellido2'] = trim($viajero['apellido2'] ?? '');

            $viajero['documento'] = strtoupper(trim($viajero['numeroDocumento']));
            $viajero['cp'] = $viajero['codigoPostal'];

            $viajero['correo'] = strtolower(trim($viajero['correo'] ?? ''));

            $validatedViajeros[$index] = validator($viajero, [
                'nombre' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido1' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido2' => ['nullable','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'fechaNacimiento' => ['required','date','before:today'],
                'sexo' => ['nullable','in:M,F,O'],
                'nacionalidad' => ['nullable'],
                'direccion' => ['required'],
                'codigoMunicipio' => ['nullable'],
                'nombreMunicipio' => ['nullable'],
                'localidad' => ['nullable'],
                'cp' => ['required'],
                'pais' => ['required'],
                'telefono' => ['nullable'],
                'correo' => ['nullable','email'],
                'tipoDocumento' => ['nullable','in:DNI,NIE,PASAPORTE'],
                'documento' => ['required','string','max:15','unique:persona,documento', new DniValido],
                'soporteDocumento' => ['nullable'],
                'rol' => ['required','in:TI,VI'],
                'parentesco' => ['nullable']
            ])->validate();
        }
        
        //1.- Guardamos personas
        // Si llegamos aquí, todos los viajeros son válidos: guardar
        $personas  = [];
        foreach ($validatedViajeros as $viajero) {
            $personas [] = Persona::create($viajero);
        }


        //2.- Obtenemos el ID del titular para la reserva, que es el primer viajero con rol TI.
        $titular = collect($personas)->first(function ($persona, $index) use ($validatedViajeros) {
            return $validatedViajeros[$index]['rol'] === 'TI';
        });


        //3.- Creamos la reserva asociada al titular.
        $establecimiento = Establecimiento::first(); // Aqui obtengo el establecimiento de la base de datos

        $reserva = Reserva::create([
            'idPersonaTitular' => $titular->idPersona,
            'codigoEstablecimiento' => $establecimiento->codigo, // mejor si viene del request
            'estado' => 'pendiente',
            'createdAt' => now(),
            'updatedAt' => now()
        ]);
        //4.- Generamos la referencia del contrato
        $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

        //5.- Creamos un contrato asociado a la reserva.
        Contrato::create([
            'referencia' => $referencia, // o código propio
            'idReserva' => $reserva->idReserva,
            'fechaContrato' => now(),
            'fechaEntrada' => $request->fechaEntrada,
            'fechaSalida' => $request->fechaSalida,
            'numPersonas' => count($personas),
            'numHabitaciones' => $request->numHabitaciones,
            'internet' => false,
            'tipoPago' => $request->tipoPago, 
            'fechaPago' => null,
            'precioTotal' => null
        ]);

        //6.- Creamos un parte asociado al contrato, con estado "pendiente".
        $parte = Parte::create([
            'referenciaContrato' => $referencia,
            'estado' => 'pendiente',
            'fechaCreacion' => now(),
            'fechaEnvio' => null,
            'createdAt' => now(),
            'updatedAt' => now()
        ]);

        
        //7.- Asociamos cada viajero al parte a través de la tabla pivote viajero_parte, 
        // indicando su rol y parentesco si es acompañante.
        foreach ($personas as $index => $persona) {
            $viajero = $validatedViajeros[$index];

            ViajeroParte::create([
                'idParte' => $parte->idParte,
                'idPersona' => $persona->idPersona,
                'rol' => $viajero['rol'],
                'parentesco' => $viajero['parentesco'] ?? null
            ]);
        }
        

 
        // Responder al frontend con JSON indicando que la reserva se ha creado correctamente y devolviendo el ID de la reserva creada.
        return response()->json([
            'success' => true,
            'reserva_id' => $reserva->idReserva
        ]);
    }

    //Funcion para confirmar la reserva, crear el parte y enviar el email al titular.
    //Es decir, cuando el arrendatario confirme la reserva, se actualiza el estado 
    // de la reserva a "confirmada", se crea un nuevo parte con el estado "pendiente" 
    // y se envía un email al titular de la reserva informándole de la confirmación.
    public function confirmar($id)
    {
        $reserva = Reserva::with('titular')->findOrFail($id);

        $reserva->estado = 'confirmada';
        $reserva->save();

        // Enviar email
        Mail::to($reserva->titular->correo)->send(
            new ReservaConfirmadaMail($reserva)
        );

        return response()->json([
            'success' => true,
            'message' => 'Reserva confirmada y email enviado'
        ]);
    }
}
