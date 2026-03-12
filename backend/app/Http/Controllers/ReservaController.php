<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReservaController extends Controller
{
    // Método para recibir la reserva
    public function crear(Request $request)
    {
        // Validación de los datos que vienen en JSON
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'apellido1' => 'required|string|max:50',
            'apellido2' => 'nullable|string|max:50',
            'fechaNacimiento' => 'nullable|date',
            'nacionalidad' => 'nullable|string|max:70',
            'direccion' => 'nullable|string|max:100',
            'codigoMunicipio' => 'nullable|string|max:5',
            'nombreMunicipio' => 'nullable|string|max:100',
            'localidad' => 'nullable|string|max:100',
            'cp' => 'nullable|string|max:20',
            'pais' => 'nullable|string|max:3',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:250',
            'sexo' => 'nullable|string|in:M,F,O',
            'tipoDocumento' => 'nullable|string|max:20',
            'documento' => 'required|string|max:15|unique:PERSONA,documento',
            'soporteDocumento' => 'nullable|string|max:9'
        ]);

        // Crear la persona en la base de datos
        $reserva = Reserva::create($validated);

        // Responder al frontend con JSON
        return response()->json([
            'success' => true,
            'reserva_id' => $reserva->idPersona
        ]);
    }
}
