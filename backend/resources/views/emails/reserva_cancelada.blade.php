<!DOCTYPE html>
<html>
<head>
    <title>Reserva Cancelada</title>
</head>
<body>
    <h1>Reserva cancelada</h1>

    <p>Hola {{ $reserva->persona->nombre }},</p>

    <p>Tu reserva ha sido cancelada por el equipo del hotel.</p>

    <ul>
        <li>Entrada: {{ $reserva->fechaEntrada }}</li>
        <li>Salida: {{ $reserva->fechaSalida }}</li>
    </ul>

    <p>Si tienes dudas, contacta con nosotros.</p>
</body>
</html>