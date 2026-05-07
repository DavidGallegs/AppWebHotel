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



class CrearParteViajeros extends Controller
{
     // Metodo para recibir la reserva desde el frontend, validar los datos, crear o actualizar las personas en la base de datos.
    public function parteViajeros(Request $request)
    {
        
        
        // IMPORTANTE: el frontend debe enviarme el idParte
        $idParte = $request->reserva_id;
   

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


}
