<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\CrearParteViajeros;
use App\Http\Controllers\Admin\ReservationAdminController;
use App\Http\Controllers\Admin\BloqueoController;
use App\Http\Controllers\NotificacionController;
 
use App\Http\Controllers\Auth\PasswordResetController;


// Aquí definimos la ruta para crear una reserva

//Cuando alguien haga un POST a /api/reservas, ejecuta el método crear del controlador ReservaController, 
// que se encargará de procesar la solicitud y crear la reserva en la base de datos.

/*******************************Admin************************* */
// Ruta para obtener todas las reservas (solo para admin)
Route::middleware('auth:sanctum')->get('/admin/reservations', [ReservationAdminController::class, 'indexAdmin']); //funciona


// Ruta para aprobar una reserva (solo para admin)
Route::patch('/admin/reservations/{id}/approve', [ReservationAdminController::class, 'approveReservation']);

// Ruta para rechazar una reserva (solo para admin)
Route::patch('/admin/reservations/{id}/reject', [ReservationAdminController::class, 'rejectReservation']);

Route::post('/admin/reservations/{id}/resolve',[ReservationAdminController::class, 'resolveRequest']);

// Ruta para crear bloqueos de fechas (solo para admin)
Route::post('/admin/bloqueos', [BloqueoController::class, 'store']);


/****************************Viajeros***************************** */

// Ruta para recuperar contraseña
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);


// Ruta para registro de usuarios
Route::post('/register', [RegisterController::class, 'registrarUsuario']);

// Ruta para login de usuarios
Route::post('/login', [LoginController::class, 'login']);

// Ruta protegida para obtener las reservas del usuario autenticado
Route::middleware('auth:sanctum')->get('/reservations', [ReservaController::class, 'index']); //funciona

// Ruta para crear reserva 
Route::post('/reservas', [ReservaController::class, 'crearReserva']); 
// Ruta para cancelar reserva
// PATCH solo modifica parcialmente un recurso (solo el estado)
Route::patch('/reservations/{id}/cancel', [ReservaController::class, 'cancelarReserva']); //ver si funciona

// Ruta para obtener detalles de una reserva especifica
Route::get('/reservas/{id}', [ReservaController::class, 'show']); //funciona

// Ruta para actualizar una reserva (por ejemplo, cambiar fechas o numero de personas)
Route::put('/reservations/{id}', [ReservaController::class, 'update']);

// Ruta para obtener la ocupacion de un establecimiento en un rango de fechas
Route::get('/ocupacion', [ReservaController::class, 'ocupacion']); //funcoina


// Ruta para crear parte de viajeros
Route::post('/viajeros', [CrearParteViajeros::class, 'parteViajeros']);

//Route::any('/reservas/{id}/confirmar', [CrearParteViajeros::class, 'confirmar']);




// Rutas del Administrador
/*
Route::middleware(['auth:sanctum', 'admin'])->group(function () { // Ajusta el middleware 'admin' al tuyo
    Route::post('/admin/reservations/{id}/resolve', [ReservaController::class, 'resolveRequest']);
});
*/

// Rutas del Usuario (Panel de cliente)
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/reservations/{id}/request-modification', [ReservaController::class, 'requestModification']);
    Route::patch('/reservations/{id}/request-cancellation', [ReservaController::class, 'requestCancellation']);
    
    // Endpoint genérico para disparar correos
    Route::post('/notificaciones/enviar', [NotificacionController::class, 'enviarNotificacion']);
});



?>