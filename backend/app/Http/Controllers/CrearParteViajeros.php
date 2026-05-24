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
use Illuminate\Support\Facades\Mail;



class CrearParteViajeros extends Controller
{
    public function parteViajeros(Request $request)
    {
        DB::beginTransaction();

        try {

            /*
            | ======================================
            | 1. OBTENER RESERVA
            | ======================================
            */
            $reserva = Reserva::findOrFail($request->reserva_id);

            /*
            | ======================================
            | 2. OBTENER CONTRATO ASOCIADO
            | ======================================
            */
            $contrato = Contrato::where(
                'idReserva',
                $reserva->idReserva
            )->first();

            if (!$contrato) {
                return response()->json([
                    'error' => 'No existe contrato asociado a la reserva'
                ], 404);
            }

            /*
            | ======================================
            | 3. CREAR PARTE
            | ======================================
            */
            $parte = Parte::create([
                'referenciaContrato' => $contrato->referencia,
                'estado' => 'pendiente',
                'fechaCreacion' => now(),
                'createdAt' => now()
            ]);

            $idParte = $parte->idParte;

            /*
            | ======================================
            | 4. UNIFICAR VIAJEROS
            | ======================================
            */
            $viajeros = [];

            foreach ($request->input('viajeros', []) as $acompanante) {
                $viajeros[] = $acompanante;
            }

            $validatedViajeros = [];
            $personas = [];

            /*
            | ======================================
            | 5. VALIDAR + UPSERT PERSONAS
            | ======================================
            */
            foreach ($viajeros as $index => $viajero) {

                /*
                | NORMALIZACIÓN
                */
                $viajero['nombre'] = trim($viajero['nombre']);
                $viajero['apellido1'] = trim($viajero['apellido1']);
                $viajero['apellido2'] = trim($viajero['apellido2'] ?? '');

                $viajero['documento'] = strtoupper(
                    trim($viajero['numeroDocumento'])
                );

                $viajero['cp'] = $viajero['codigoPostal'];
                $viajero['nacionalidad'] = $viajero['pais'];

                $viajero['correo'] = isset($viajero['correo'])
                    ? strtolower(trim($viajero['correo']))
                    : null;

                /*
                | VALIDACIÓN
                */
                validator($viajero, [
                    'nombre' => [
                        'required',
                        'regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'
                    ],
                    'apellido1' => [
                        'required',
                        'regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'
                    ],
                    'apellido2' => [
                        'nullable',
                        'regex:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/u'
                    ],
                    'fechaNacimiento' => [
                        'required',
                        'date',
                        'before:today'
                    ],
                    'direccion' => ['required'],
                    'cp' => ['required'],
                    'telefono' => ['nullable'],
                    'correo' => ['nullable', 'email'],
                    'tipoDocumento' => [
                        'nullable',
                        'in:DNI,NIE,PASAPORTE'
                    ],
                    'documento' => [
                        'required',
                        'string',
                        'max:15',
                        new DniValido
                    ],
                    'rol' => [
                        'required',
                        'in:TI,VI'
                    ],
                    'parentesco' => ['nullable']
                ])->validate();

                /*
                | UPSERT PERSONA
                */
                $persona = Persona::updateOrCreate(
                    [
                        'documento' => $viajero['documento']
                    ],
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
                        'email' => $viajero['correo'] ?? null,
                        'tipoDocumento' => $viajero['tipoDocumento'] ?? null,
                        'soporteDocumento' => $viajero['soporteDocumento'] ?? null,
                    ]
                );

                $validatedViajeros[$index] = $viajero;
                $personas[$index] = $persona;
            }

            /*
            | ======================================
            | 6. CREAR VIAJERO_PARTE
            | ======================================
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
            | ======================================
            | 7. ACTUALIZAR RESERVA
            | ======================================
            */
            $reserva->estado = 'finished';
            $reserva->updatedAt = now();
            $reserva->save();

            DB::commit();

            /*
            | ======================================
            | 8. RESPUESTA
            | ======================================
            */
            return response()->json([
                'success' => true,
                'message' => 'Parte de viajeros registrado correctamente',
                'idParte' => $idParte
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
