<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitud de cancelación</title>
</head>
<body>

    <h2>Solicitud de cancelación</h2>

    <p>
        El usuario
        <strong>{{ $reserva->titular->nombre }}</strong>
        solicita cancelar la reserva
        <strong>#{{ $reserva->idReserva }}</strong>.
    </p>

    <p>
        <strong>Fecha entrada:</strong>
        {{ $reserva->fechaEntrada }}
    </p>

    <p>
        <strong>Fecha salida:</strong>
        {{ $reserva->fechaSalida }}
    </p>

    <p>
        Revisa la solicitud desde el panel de administración.
    </p>

</body>
</html>