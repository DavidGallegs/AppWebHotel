<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Persona;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function registrarUsuario(Request $request)
    {
        try {

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'apellido1' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
            ]);

            DB::beginTransaction();

            $nombre = Str::ucfirst(Str::lower($validated['name']));
            $apellido1 = Str::ucfirst(Str::lower($validated['apellido1']));
            $email = Str::lower($validated['email']);

            /*
            | 1. CREAR O ACTUALIZAR PERSONA (SIN DUPLICADOS)
            */
            $persona = Persona::updateOrCreate(
                [
                    'email' => $email
                ],
                [
                    'nombre' => $nombre,
                    'apellido1' => $apellido1,
                    'email' => $email,
                ]
            );

            /*
            | 2. CREAR USUARIO ASOCIADO A LA PERSONA
            */
            User::create([
                'idPersona' => $persona->idPersona,
                'email' => $email,
                'password' => Hash::make($validated['password']),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Usuario registrado correctamente'
            ], 201);

        } catch (ValidationException $e) {

            return response()->json([
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => 'Error en el registro',
                'detalle_real' => $e->getMessage()
            ], 400);
        }
    }
}
