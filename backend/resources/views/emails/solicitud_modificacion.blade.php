<!DOCTYPE html>
<html>
<head>
    <title>Solicitud de Modificación</title>
</head>
<body>
    <h2>Solicitud de modificación</h2>

    <p><strong>Habitación:</strong> {{ $datos['reserva']['idHabitacion'] ?? 'No disponible' }}</p>
    <p><strong>Entrada:</strong> {{ $datos['reserva']['fechaEntrada'] ?? 'No disponible' }}</p>
    <p><strong>Salida:</strong> {{ $datos['reserva']['fechaSalida'] ?? 'No disponible' }}</p>
    <p><strong>Personas:</strong> {{ $datos['reserva']['numPersonas'] ?? 'No disponible' }}</p>

    <h3>Titular</h3>

    <p><strong>Nombre:</strong> {{ $datos['titular']['nombre'] ?? 'No disponible' }}</p>
    <p><strong>Apellido:</strong> {{ $datos['titular']['apellido1'] ?? 'No disponible' }}</p>
    <p><strong>Email:</strong> {{ $datos['titular']['correo'] ?? 'No disponible' }}</p>
</body>
</html>