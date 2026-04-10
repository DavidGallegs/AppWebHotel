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
    // Metodo para recibir la reserva desde el frontend, validar los datos, crear o actualizar las personas en la base de datos.
    public function crear(Request $request)
    {
        // 1. Unificar viajeros (titular + acompañantes)
        $viajeros = [];

        $viajeros[] = $request->input('titular');

        foreach ($request->input('acompanantes', []) as $acompanante) {
            $viajeros[] = $acompanante;
        }

        //Array para almacenar los viajeros validados y las personas creadas/actualizadas en la base de datos.
        $validatedViajeros = [];


        // 2. Validacion de cada viajero, y creacion o actualizacion en la base de datos.
        foreach ($viajeros as $index => $viajero) {

            // Normalización de datos
            $viajero['nombre'] = trim($viajero['nombre']);
            $viajero['apellido1'] = trim($viajero['apellido1']);
            $viajero['apellido2'] = trim($viajero['apellido2']);

            $viajero['documento'] = strtoupper(trim($viajero['numeroDocumento']));
            $viajero['cp'] = $viajero['codigoPostal'];
            $viajero['nacionalidad'] = $viajero['pais'];
            $viajero['correo'] = strtolower(trim($viajero['correo'] ?? null));

            $validated = validator($viajero, [
                'nombre' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido1' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido2' => ['nullable','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'fechaNacimiento' => ['required','date','before:today'],
                'direccion' => ['required'],
                'cp' => ['required'],
                'telefono' => ['nullable'],
                'correo' => ['nullable','email'],
                'tipoDocumento' => ['nullable','in:DNI,NIE,PASAPORTE'],
                'documento' => ['required','string','max:15', new DniValido],
                'rol' => ['required','in:TI,VI'],
                'parentesco' => ['nullable']
            ])->validate();
            
            // UPSERT - Si el documento ya existe, actualiza la persona, si no existe, crea una nueva persona.
            $persona = Persona::updateOrCreate(
                ['documento' => $viajero['documento']],
                [
                    'nombre' => $viajero['nombre'],
                    'apellido1' => $viajero['apellido1'],
                    'apellido2' => $viajero['apellido2'] ?? null,
                    'fechaNacimiento' => $viajero['fechaNacimiento'],
                    'nacionalidad' => $viajero['nacionalidad'],
                    'direccion' => $viajero['direccion'],
                    'codigoMunicipio' => $viajero['codigoMunicipio'] ?? null,
                    'nombreMunicipio' => $viajero['nombreMunicipio'] ?? null,
                    'localidad' => $viajero['localidad'] ?? null,
                    'cp' => $viajero['cp'],
                    'telefono' => $viajero['telefono'] ?? null,
                    'correo' => $viajero['correo'] ?? null,
                    'tipoDocumento' => $viajero['tipoDocumento'] ?? null,
                    'soporteDocumento' => $viajero['soporteDocumento'] ?? null,
                ]
            );

            // Almacenamos el viajero validado y la persona creada/actualizada en los arrays correspondientes.
            $validatedViajeros[$index] = $viajero;
            $personas[$index] = $persona;
            
        }


        //3.- Obtenemos el ID del titular para la reserva, que es el primer viajero con rol TI, es decir, busco el viajero con rol titular para asignarlo a la reserva.
        $titular = collect($personas)->first(function ($persona, $index) use ($validatedViajeros) {
            return $validatedViajeros[$index]['rol'] === 'TI';
        });


        //4.- Creamos la reserva asociada al titular.
        $establecimiento = Establecimiento::first(); // Aqui obtengo el establecimiento de la base de datos

        $reserva = Reserva::create([
            'idPersonaTitular' => $titular->idPersona,
            'codigoEstablecimiento' => $establecimiento->codigo, // mejor si viene del request
            'estado' => 'pendiente',
            'createdAt' => now(),
            'updatedAt' => now()
        ]);
        //5.- Generamos la referencia del contrato
        $referencia = 'HR-RES-' . date('Ymd') . '-' . str_pad($reserva->idReserva, 4, '0', STR_PAD_LEFT);

        //6.- Creamos un contrato asociado a la reserva.
        Contrato::create([
            'referencia' => $referencia, 
            'idReserva' => $reserva->idReserva,
            'fechaContrato' => now(),
            'fechaEntrada' => $request->fechaEntrada,
            'fechaSalida' => $request->fechaSalida,
            'numPersonas' => $request->numPersonas,
            'numHabitaciones' => $request->numHabitaciones,
            'internet' => false,
            'tipoPago' => null, 
            'fechaPago' => null,
            'precioTotal' => null
        ]);

        //7.- Creamos un parte asociado al contrato, con estado "pendiente".
        $parte = Parte::create([
            'referenciaContrato' => $referencia,
            'estado' => 'pendiente',
            'fechaCreacion' => now(),
            'fechaEnvio' => null,
            'createdAt' => now(),
            'updatedAt' => now()
        ]);

        
        //8.- Asociamos cada viajero al parte a traves de la tabla viajero_parte, 
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

 
        // Responder al frontend con JSON indicando que la reserva se ha creado correctamente.
        return response()->json([
            'success' => true
        ]);
    }

    //Funcion para confirmar la reserva, crear el parte y enviar el email al titular.
    //Es decir, cuando el arrendatario confirme la reserva, se actualiza el estado 
    // de la reserva a "confirmada", se crea un nuevo parte con el estado "pendiente" 
    // y se envia un email al titular de la reserva informandole de la confirmación.
    public function confirmar($id)
    {
        $reserva = Reserva::with('titular')->findOrFail($id);

        // Actualizar estado de la reserva a "confirmada"
        $reserva->estado = 'confirmada';
        $reserva->save(); // Guardamos los cambios en la base de datos.

        //Enviamos el email al titular.
        Mail::to($reserva->titular->correo)->send(
            new ReservaConfirmadaMail($reserva)
        );

        //Respuesta JSON indicando que la reserva se ha confirmado y el email se ha enviado correctamente.
        return response()->json([
            'success' => true,
            'message' => 'Reserva confirmada y email enviado'
        ]);
    }
}
