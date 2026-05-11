<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Administrador;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpLoginMail;


class LoginController extends Controller
{
    public function login(Request $request)
    {
        $response = null;
        $status = 401;

        try {

            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
                'otp' => 'required'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {

                $response = [
                    'message' => 'Credenciales incorrectas'
                ];

            } else {

                $otpData = Cache::get('otp_' . $user->id);

                if (
                    !$otpData ||
                    $otpData['code'] != $request->otp ||
                    now()->gt($otpData['expires_at'])
                ) {

                    $response = [
                        'message' => 'OTP inválido o expirado'
                    ];

                } else {

                    Cache::forget('otp_' . $user->id);

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
            }

        } catch (\Exception $e) {

            $response = [
                'message' => 'Error en login',
                'error' => $e->getMessage()
            ];

            $status = 500;
        }

        return response()->json($response, $status);
    }

    public function preLogin(Request $request)
    {
        $response = null;
        $status = 401;

        try {

            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {

                $response = [
                    'message' => 'Credenciales incorrectas'
                ];

            } else {

                $otp = random_int(100000, 999999);

                Cache::put('otp_' . $user->id, [
                    'code' => $otp,
                    'expires_at' => now()->addMinutes(5)
                ], now()->addMinutes(5));

                Mail::to($user->email)->send(
                    new \App\Mail\OtpLoginMail($otp)
                );

                $status = 200;

                $response = [
                    'message' => 'Código OTP enviado al correo'
                ];
            }

        } catch (\Exception $e) {

            $response = [
                'message' => 'Error en pre-login',
                'error' => $e->getMessage()
            ];

            $status = 500;
        }

        return response()->json($response, $status);
    }
}
