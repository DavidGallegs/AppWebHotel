<!DOCTYPE html>
<html>
<head>
    <title>Reserva Confirmada</title>
</head>
<body>
    <h1>Tu reserva ha sido confirmada</h1>

    <p>Hola {{ $reserva->titular->nombre }},</p>

    <p>Tu reserva con ID {{ $reserva->idReserva }} ha sido confirmada.</p>

    <p>Gracias por confiar en nosotros.</p>
</body>
</html>