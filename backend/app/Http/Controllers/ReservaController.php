<?php

namespace App\Http\Controllers;
use App\Models\Persona;
use App\Models\Reserva;
use Illuminate\Http\Request;
use App\Rules\DniValido;

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
        $reserva = Reserva::create([
            'idPersonaTitular' => $titular->idPersona,
            'codigoEstablecimiento' => '0000004063', // mejor si viene del request
            'estado' => 'pendiente',
            'createdAt' => now(),
            'updatedAt' => now()
        ]);
 
        // Responder al frontend con JSON indicando que la reserva se ha creado correctamente y devolviendo el ID de la reserva creada.
        return response()->json([
            'success' => true,
            'reserva_ids' => $personas 
        ]);
    }
}
