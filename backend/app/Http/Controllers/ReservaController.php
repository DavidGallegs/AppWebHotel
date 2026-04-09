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
        $validatedViajeros = [];
        //Recorremos cada viajero enviado desde el frontend.
        foreach ($request->input('viajeros') as $index => $viajero) {
            
            $viajero['nombre'] = trim($viajero['nombre']);
            $viajero['apellido1'] = trim($viajero['apellido1']);
            $viajero['apellido2'] = trim($viajero['apellido2']);
            $viajero['documento'] = strtoupper(trim($viajero['documento']));
            $viajero['correo'] = strtolower(trim($viajero['correo']));

            //Validacion de cada viajero.
            $validatedViajeros[$index] = validator($viajero,[
                'nombre' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido1' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'apellido2' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'],
                'fechaNacimiento' => ['required','date','before:today'],
                'sexo' => ['required','in:M,F,O'],
                'nacionalidad' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,70}$/u'],
                'direccion' => ['required','regex:/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.,ºª\-\/]{1,100}$/u'],
                'codigoMunicipio' => ['required','regex:/^[0-9]{1,5}$/'],
                'nombreMunicipio' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,100}$/u'],
                'localidad' => ['required','regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,100}$/u'],
                'cp' => ['required','regex:/^[0-9]{5}$/'],
                'pais' => ['required','regex:/^[A-Z]{2,3}$/'],
                'telefono' => ['required','regex:/^[0-9\+\s]{7,20}$/'],
                'correo' => ['required','email','max:250'],
                'tipoDocumento' => ['required','in:DNI,NIE,PASAPORTE'],
                'documento' => ['required','string','max:15','unique:persona,documento', new DniValido], 
                'soporteDocumento' => ['required','regex:/^[A-Z]{2}[0-9]{7}$/'],
                'rol' => ['required','in:TI,VI'],
                // Si el viajero es un acompañante, el campo parentesco es obligatorio, si es titular no se requiere.
                'parentesco' => $viajero['rol'] === 'VI' 
                    ? ['required', 'string', 'max:5'] 
                    : []
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

        /*
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
        */

 
        // Responder al frontend con JSON indicando que la reserva se ha creado correctamente y devolviendo el ID de la reserva creada.
        return response()->json([
            'success' => true,
            'reserva_ids' => $personas 
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
