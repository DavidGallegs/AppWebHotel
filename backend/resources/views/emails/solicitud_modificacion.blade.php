<!DOCTYPE html>
<html>
<head>
    <title>Solicitud de Modificación</title>
</head>
<body>
    <h2>Solicitud de modificación</h2>

    <p><strong>Habitación:</strong> {{ $datos['habitacion'] }}</p>
    <p><strong>Entrada:</strong> {{ $datos['fechaEntrada'] }}</p>
    <p><strong>Salida:</strong> {{ $datos['fechaSalida'] }}</p>
    <p><strong>Personas:</strong> {{ $datos['numPersonas'] }}</p>

    <h3>Titular</h3>

    <p><strong>Nombre:</strong> {{ $datos['titular']['nombre'] }}</p>
    <p><strong>Apellido:</strong> {{ $datos['titular']['apellido1'] }}</p>
    <p><strong>Email:</strong> {{ $datos['titular']['correo'] }}</p>
</body>
</html>