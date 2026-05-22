<!DOCTYPE html>
<html>
<head>
    <title>Reserva Cancelada</title>
</head>
<body>
    <h2>Hola {{ $persona->nombre }}</h2>

    <p>Te informamos que tu reserva ha sido cancelada correctamente.</p>

    <h3>Detalles de la reserva:</h3>

    <ul>
        <li><strong>ID:</strong> {{ $reserva->idReserva }}</li>
        <li><strong>Fecha entrada:</strong> {{ $reserva->fechaEntrada }}</li>
        <li><strong>Fecha salida:</strong> {{ $reserva->fechaSalida }}</li>
    </ul>

    <p>Si tienes dudas, contacta con el hotel.</p>
</body>
</html>