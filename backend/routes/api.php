<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;

// Aquí definimos la ruta para crear una reserva

//Cuando alguien haga un POST a /api/reservas, ejecuta el método crear del controlador ReservaController, 
// que se encargará de procesar la solicitud y crear la reserva en la base de datos.
Route::post('/reservas', [ReservaController::class, 'crear']);

?>