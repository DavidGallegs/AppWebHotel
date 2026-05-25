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

/*******************************Admin************************* */
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Ruta para obtener todas las reservas (solo para admin)
    Route::get('/reservations', [ReservationAdminController::class, 'indexAdmin']);

    // Ruta para dar de alta a los viajeros en el parte de viajeros (solo para admin)
    Route::post('/reservations/{id}/checkin', [CrearParteViajeros::class, 'parteViajeros']);
});

// ⚠️ Nota: Sería recomendable que estas rutas de Admin también estuvieran 
// dentro del grupo 'auth:sanctum' de arriba por seguridad.
Route::post('/admin/walk-in', [CheckInController::class, 'walkIn']);
Route::delete('/admin/reservations/{id}', [ReservationAdminController::class, 'rejectReservation']);
Route::post('/admin/bloqueos', [BloqueoController::class, 'store']);
Route::post('/admin/reservations/{id}/confirmar-pago', [AdminReservaController::class, 'confirmarPago']);

// ---> ¡AQUÍ ESTÁ LA NUEVA RUTA DEL ADMIN (RESOLVER SOLICITUDES)! <---
Route::post('/admin/reservations/{id}/resolve', [AdminReservaController::class, 'resolve']);


/****************************Viajeros***************************** */

// Rutas Públicas (No requieren estar logueado)
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/register', [RegisterController::class, 'registrarUsuario']);
Route::post('/reservas', [ReservaController::class, 'crearReserva']);
Route::post('/pre-login', [LoginController::class, 'preLogin']);
Route::post('/login', [LoginController::class, 'login']);
Route::get('/reservas/{id}', [ReservaController::class, 'show']); 
Route::get('/ocupacion', [ReservaController::class, 'ocupacion']);


// Rutas Protegidas del Usuario (Panel de cliente)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reservations', [ReservaController::class, 'index']); 
    
    // Ruta para Modificación Directa (Estado: Pendiente)
    Route::put('/reservations/{id}', [ReservaController::class, 'update']);
    
    // ---> RUTAS DE SOLICITUDES AL ADMIN (Estado: Aprobada) <---
    Route::patch('/reservations/{id}/request-modification', [ReservaController::class, 'requestModification']);
    Route::post('/reservations/{id}/solicitar-devolucion', [ReservaController::class, 'solicitarDevolucion']);
    
    // Otras rutas del usuario
    Route::patch('/reservations/{id}/cancel', [ReservaController::class, 'cancelarReserva']); // ¿O cancelarDirectamente? Usa la que tengas definida
    Route::patch('/reservations/{id}/request-cancellation', [ReservaController::class, 'solicitarCancelacion']);
    Route::post('/notificaciones/enviar', [NotificacionController::class, 'enviarNotificacion']);
    Route::post('/reservations/{id}/notificar-pago',[ReservaController::class, 'notificarPago']);
    Route::post('reservations/{id}/checkin', [CrearParteViajeros::class, 'parteViajeros']);
});


/****************************************COMUNICACION SES******************************************* */
Route::get('/admin/ses/data', [SesController::class, 'logs']);
Route::post('/admin/ses/anular/{id}', [SesController::class, 'anularSES']);

?>