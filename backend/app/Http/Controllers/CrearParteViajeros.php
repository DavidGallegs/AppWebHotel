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

use App\Mail\ReservaConfirmadaMail;
use Illuminate\Support\Facades\Mail;

class CrearParteViajeros extends Controller
{
     // Metodo para recibir la reserva desde el frontend, validar los datos, crear o actualizar las personas en la base de datos.
    public function parteViajeros(Request $request)
    {
        
        
        // IMPORTANTE: el frontend debe enviarte el idParte
        //$idParte = $request->idParte;
        $idParte = 1; // Esto es solo para pruebas, luego debes usar el idParte real que te envíe el frontend.

        // 1. Unificar viajeros (titular + acompañantes)
        $viajeros = [];

        //$viajeros[] = $request->input('titular');

        foreach ($request->input('viajeros', []) as $acompanante) {
            $viajeros[] = $acompanante;
        }

        $validatedViajeros = [];
        $personas = [];

        // 2. Validación + UPSERT de Persona
        foreach ($viajeros as $index => $viajero) {

            // Normalización
            $viajero['nombre'] = trim($viajero['nombre']);
            $viajero['apellido1'] = trim($viajero['apellido1']);
            $viajero['apellido2'] = trim($viajero['apellido2']);

            $viajero['documento'] = strtoupper(trim($viajero['numeroDocumento']));
            $viajero['cp'] = $viajero['codigoPostal'];
            $viajero['nacionalidad'] = $viajero['pais'];
            $viajero['correo'] = isset($viajero['correo']) 
                ? strtolower(trim($viajero['correo'])) 
                : null;

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

            // UPSERT Persona
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

            $validatedViajeros[$index] = $viajero;
            $personas[$index] = $persona;
        }

        // 3. Insertar en viajero_parte
        foreach ($personas as $index => $persona) {
            $viajero = $validatedViajeros[$index];

            ViajeroParte::create([
                'idParte' => $idParte,
                'idPersona' => $persona->idPersona,
                'rol' => $viajero['rol'],
                'parentesco' => $viajero['parentesco'] ?? null
            ]);
        }

        

        // Responder al frontend con JSON indicando que la reserva se ha creado correctamente.
        return response()->json([
            'data' => $request->all()
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
