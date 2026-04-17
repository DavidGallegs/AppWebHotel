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

            'nacionalidad' => ['nullable','string','max:3'],

            'direccion' => ['required','string','max:255'],

            'codigoMunicipio' => ['nullable','string','max:10'],
            'nombreMunicipio' => ['nullable','string','max:100'],
            'localidad' => ['nullable','string','max:100'],

            'cp' => ['required','string','max:10'],

            'telefono' => ['nullable','string','max:20'],
            'correo' => ['nullable','email','max:255'],

            'tipoDocumento' => ['nullable','in:DNI,NIE,PASAPORTE'],
            'documento' => ['required','string','max:15', new DniValido]
        ])->validate();

        // 4. Upsert persona
        $persona = Persona::updateOrCreate(
            [
                'documento' => $validated['documento'],
            ],
            [
                'nombre' => $validated['nombre'],
                'apellido1' => $validated['apellido1'],
                'apellido2' => $validated['apellido2'] ?? null,
                'fechaNacimiento' => $validated['fechaNacimiento'],
                'nacionalidad' => $validated['nacionalidad'] ?? null,
                'direccion' => $validated['direccion'],
                'codigoMunicipio' => $validated['codigoMunicipio'] ?? null,
                'nombreMunicipio' => $validated['nombreMunicipio'] ?? null,
                'localidad' => $validated['localidad'] ?? null,
                'cp' => $validated['cp'],
                'email' => $validated['correo'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'tipoDocumento' => $validated['tipoDocumento'] ?? null,
                'soporteDocumento' => $validated['soporteDocumento'] ?? null,
            ]
        );

        // 5. Crear reserva (solo titular)
        $establecimiento = Establecimiento::first();

       

        $reserva = Reserva::create([
            'idPersonaTitular' => $persona->idPersona,
            'codigoEstablecimiento' => $establecimiento->codigo,
            'numPersonas' => $request->input('numPersonas', 1),
            'numHabitaciones' => $request->input('numHabitaciones', 1),
            'fechaEntrada' => $request->input('fechaEntrada'),
            'fechaSalida' => $request->input('fechaSalida'),
            'estado' => 'pendiente',
            'createdAt' => now(),
            'updatedAt' => now(),
        ]);

        return response()->json([
            'success' => true
        ]);
    }

}
