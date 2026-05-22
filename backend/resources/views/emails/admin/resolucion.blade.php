<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resolución de solicitud</title>
</head>
<body>

    <h2>Tu solicitud ha sido revisada</h2>

    <p>
        Hola
        <strong>{{ $reserva->titular->nombre }}</strong>,
    </p>

    @if($tipo === 'resolucion_mod_user')

        <p>
            La solicitud de modificación de tu reserva
            <strong>#{{ $reserva->idReserva }}</strong>
            ha sido procesada.
        </p>

    @elseif($tipo === 'resolucion_cancel_user')

        <p>
            La solicitud de cancelación de tu reserva
            <strong>#{{ $reserva->idReserva }}</strong>
            ha sido procesada.
        </p>

    @endif

    <p>
        Revisa tu panel de usuario para consultar el estado actualizado.
    </p>

    <p>
        Gracias por confiar en nosotros.
    </p>

</body>
</html>