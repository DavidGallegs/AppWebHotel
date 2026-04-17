<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;

// Aquí definimos la ruta para crear una reserva

//Cuando alguien haga un POST a /api/reservas, ejecuta el método crear del controlador ReservaController, 
// que se encargará de procesar la solicitud y crear la reserva en la base de datos.


Route::post('/register', [RegisterController::class, 'registrarUsuario']);
Route::post('/login', [LoginController::class, 'login']);


Route::post('/reservas', [ReservaController::class, 'crearReserva']);

Route::any('/reservas/{id}/confirmar', [ReservaController::class, 'confirmar']);

?>