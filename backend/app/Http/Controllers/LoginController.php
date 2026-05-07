<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Administrador;


class LoginController extends Controller
{
    public function login(Request $request)
    {
         // Validación
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $status = 401;
        $response = [
            'message' => 'Credenciales incorrectas'
        ];

        // Buscar usuario
        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {

            $token = $user->createToken('auth_token')->plainTextToken;

            $status = 200;
            $response = [
                'token' => $token,
                'role' => $user->rol,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->persona->nombre ?? null,
                    'email' => $user->email
                ]
            ];
        }

        return response()->json($response, $status);
    }
}
