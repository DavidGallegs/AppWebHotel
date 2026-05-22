<!DOCTYPE html>
<html>
<head>
    <title>Reserva Confirmada</title>
</head>
<body>
    <h1>Estado de tu reserva actualizado</h1>

    <p>Hola {{ $reserva->persona->nombre }},</p>

    <p>Te informamos de que el estado de tu reserva ha sido actualizado.</p>

    <ul>
        <li>Estado: {{ $reserva->estado }}</li>
        <li>Entrada: {{ $reserva->fechaEntrada }}</li>
        <li>Salida: {{ $reserva->fechaSalida }}</li>
    </ul>

    <p>Gracias por confiar en nosotros.</p>
</body>
</html>