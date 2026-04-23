<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;

// Aquí definimos la ruta para crear una reserva

//Cuando alguien haga un POST a /api/reservas, ejecuta el método crear del controlador ReservaController, 
// que se encargará de procesar la solicitud y crear la reserva en la base de datos.


// Ruta para registro de usuarios
Route::post('/register', [RegisterController::class, 'registrarUsuario']);

// Ruta para login de usuarios
Route::post('/login', [LoginController::class, 'login']);

// Ruta protegida para obtener las reservas del usuario autenticado
Route::middleware('auth:sanctum')->get('/reservations', [ReservaController::class, 'index']);

// Ruta para crear reserva 
Route::post('/reservas', [ReservaController::class, 'crearReserva']);

// Ruta para crear parte de viajeros
Route::post('/viajeros', [CrearParteViajeros::class, 'parteViajeros']);




Route::any('/reservas/{id}/confirmar', [CrearParteViajeros::class, 'confirmar']);

?>