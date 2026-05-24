<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\CrearParteViajeros;
use App\Http\Controllers\Admin\ReservationAdminController;
use App\Http\Controllers\Admin\BloqueoController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\Admin\CheckInController;
use App\Http\Controllers\Admin\AdminReservaController;
 
use App\Http\Controllers\Auth\PasswordResetController;

use App\Http\Controllers\Ses\SesController;




// Aqui definimos la ruta para crear una reserva


/*******************************Admin************************* */
// Ruta para obtener todas las reservas (solo para admin)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    // Ruta para obtener todas las reservas (solo para admin)
    Route::get('/reservations', [ReservationAdminController::class, 'indexAdmin']);

    // Ruta para dar de alta a los viajeros en el parte de viajeros (solo para admin)
    Route::post('/reservations/{id}/checkin', [CrearParteViajeros::class, 'parteViajeros']);

    // Ruta para realizar check-in de walk-in (solo para admin)
    //Route::post('/admin/walk-in', [CheckInController::class, 'walkIn']);
});

Route::post('/admin/walk-in', [CheckInController::class, 'walkIn']);


// Ruta para rechazar una reserva (solo para admin)
Route::delete('/admin/reservations/{id}', [ReservationAdminController::class, 'rejectReservation']);

// Ruta para crear bloqueos de fechas (solo para admin)
Route::post('/admin/bloqueos', [BloqueoController::class, 'store']);



// Ruta para confirmar pago de una reserva (solo para admin)
Route::post('/admin/reservations/{id}/confirmar-pago', [AdminReservaController::class, 'confirmarPago']);


/****************************Viajeros***************************** */

// Ruta para recuperar contraseña
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);


// Ruta para registro de usuarios
Route::post('/register', [RegisterController::class, 'registrarUsuario']);

// Ruta para crear reserva 
Route::post('/reservas', [ReservaController::class, 'crearReserva']);

// Ruta para pre-login (enviar OTP)
Route::post('/pre-login', [LoginController::class, 'preLogin']);

// Ruta para login de usuarios
Route::post('/login', [LoginController::class, 'login']);

// Ruta protegida para obtener las reservas del usuario autenticado
Route::middleware('auth:sanctum')->get('/reservations', [ReservaController::class, 'index']); 




// Ruta para obtener detalles de una reserva especifica
Route::get('/reservas/{id}', [ReservaController::class, 'show']); 


// Ruta para obtener la ocupacion de un establecimiento en un rango de fechas
Route::get('/ocupacion', [ReservaController::class, 'ocupacion']);


// Rutas del Usuario (Panel de cliente)
Route::middleware('auth:sanctum')->group(function () {

    


    Route::patch('/reservations/{id}/request-modification', [ReservaController::class, 'solicitarModificacion']);
    Route::patch('/reservations/{id}/cancel', [ReservaController::class, 'cancelarReserva']);
    Route::patch('/reservations/{id}/request-cancellation', [ReservaController::class, 'solicitarCancelacion']);
    
    // Endpoint genérico para disparar correos
    Route::post('/notificaciones/enviar', [NotificacionController::class, 'enviarNotificacion']);

    Route::post('/reservations/{id}/notificar-pago',[ReservaController::class, 'notificarPago']);


    Route::post('/reservations/{id}/solicitar-devolucion',[ReservaController::class, 'solicitarDevolucion']);
});



/****************************************COMUNICACION SES******************************************* */



Route::get('/admin/ses/logs', [SesController::class, 'logs']);
Route::post('/admin/ses/anular/{id}', [SesController::class, 'anularSES']);


?>