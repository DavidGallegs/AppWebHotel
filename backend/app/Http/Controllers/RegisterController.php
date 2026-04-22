<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Persona;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function registrarUsuario(Request $request)
    {
        //dd('LLEGA AL CONTROLADOR');

        
        try {
            // Validacion
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            DB::beginTransaction();
            //1.- Crear persona (solo datos basicos)
            $persona = Persona::create([
                'nombre' => $validated['name'],
                'email' => $validated['email'],
            ]);

            //2.- Crear usuario en la tabla users, relacionandolo con la persona creada
            User::create([
                'idPersona' => $persona->idPersona,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            DB::commit();



            // Respuesta OK
            return response()->json([
                'message' => 'Usuario registrado correctamente'
            ], 201);

        }catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en el registro'
            ], 400);
        }
    }
}
