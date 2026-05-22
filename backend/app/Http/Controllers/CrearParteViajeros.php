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
    public function parteViajeros(Request $request)
    {
        $idParte = $request->reserva_id;

        /*
        |1. UNIFICAR DATOS DE TITULAR Y ACOMPAÑANTES 
        */
        $viajeros = [];

        foreach ($request->input('viajeros', []) as $acompanante) {
            $viajeros[] = $acompanante;
        }

        $validatedViajeros = [];
        $personas = [];

        /*
        |2. VALIDAR Y NORMALIZAR DATOS DE CADA VIAJERO, Y CREAR O ACTUALIZAR REGISTRO EN PERSONA
        */
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

            /*
            |UPSERT EN PERSONA: SI EXISTE DOCUMENTO, ACTUALIZA. SI NO, CREA NUEVO REGISTRO
            */
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
        
        /*
        |3. CREAR REGISTROS EN VIAJERO_PARTE PARA ASOCIAR CADA PERSONA 
        */
        foreach ($personas as $index => $persona) {
            $viajero = $validatedViajeros[$index];

            ViajeroParte::create([
                'idParte' => $idParte,
                'idPersona' => $persona->idPersona,
                'rol' => $viajero['rol'],
                'parentesco' => $viajero['parentesco'] ?? null
            ]);
        }

        /*
        |4. ACTUALIZAR ESTADO DE LA RESERVA A 'finished' PARA INDICAR QUE EL CHECK-IN SE HA COMPLETADO Y SE HA CREADO EL PARTE DE VIAJEROS
        */
        $reserva = Reserva::findOrFail($request->reserva_id);

        $reserva->estado = 'finished';
        $reserva->updatedAt = now();
        $reserva->save();
        
        return response()->json([
            'data' => $request->all()
        ]);
    }
}
