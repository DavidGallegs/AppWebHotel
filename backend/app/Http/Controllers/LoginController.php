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
        // Validar datos
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $usuario = null;
        $role = null;

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRADOR
        |--------------------------------------------------------------------------
        */

        $admin = Administrador::where('email', $request->email)->first();

        if ($admin && Hash::check($request->password, $admin->passwordHash)) {

            $usuario = [
                'id' => $admin->idUsuario,
                'name' => $admin->userName,
                'email' => $admin->email
            ];

            $role = 'admin';

            $token = $admin->createToken('admin_token')->plainTextToken;
        }

        /*
        |--------------------------------------------------------------------------
        | USUARIO NORMAL
        |--------------------------------------------------------------------------
        */

        else {

            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {

                $usuario = [
                    'id' => $user->id,
                    'name' => $user->persona->nombre,
                    'email' => $user->email
                ];

                $role = 'user';

                $token = $user->createToken('auth_token')->plainTextToken;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ERROR LOGIN
        |--------------------------------------------------------------------------
        */

        if (!$usuario) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | ÚNICO RETURN
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'token' => $token,
            'role' => $role,
            'user' => $usuario
        ], 200);
    }
}
