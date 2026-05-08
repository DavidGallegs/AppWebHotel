<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitud de modificación</title>
</head>
<body>

    <h2>Solicitud de modificación de reserva</h2>

    <p>
        El usuario
        <strong>{{ $reserva->titular->nombre }}</strong>
        ha solicitado modificar la reserva
        <strong>#{{ $reserva->idReserva }}</strong>.
    </p>

    <p>
        <strong>Entrada actual:</strong>
        {{ $reserva->fechaEntrada }}
    </p>

    <p>
        <strong>Salida actual:</strong>
        {{ $reserva->fechaSalida }}
    </p>

    <p>
        Accede al panel de administración para revisar la solicitud.
    </p>

</body>
</html>