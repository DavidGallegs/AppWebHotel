<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validar entrada
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Buscar usuario
        $user = User::where('email', $request->email)->first();

        // 3. Verificar existencia y contraseña
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // 4. Crear token 
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Respuesta 
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->persona->nombre,
                'email' => $user->email
            ],
            'token' => $token
        ], 200);
    }
}
