<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */

    /*
    | AQUI CONFIGURAMOS LA URL PARA EL RESETEO DE CONTRASEÑA, QUE SE ENVIARA EN EL CORREO DE RESTABLECIMIENTO DE CONTRASEÑA.
    */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {

            return 'http://localhost:4321/resetPassword'
                . '?token=' . $token
                . '&email=' . urlencode($user->email);
        });
    }
}
