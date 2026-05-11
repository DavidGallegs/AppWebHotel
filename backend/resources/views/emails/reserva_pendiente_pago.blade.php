<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reserva pendiente de pago</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">

    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">

        <h2>¡Tu reserva está casi lista!</h2>

        <p>
            Hola {{ $persona->nombre }},
        </p>

        <p>
            Para confirmar tu estancia del
            <strong>{{ $reserva->fechaEntrada }}</strong>
            al
            <strong>{{ $reserva->fechaSalida }}</strong>,
            necesitamos que realices una transferencia de:
        </p>

        <h2 style="color:#2c7a7b;">
            {{ number_format($precio, 2) }}€
        </h2>

        <p>
            <strong>IBAN:</strong><br>
            ES21 1234 5678 9012 3456
        </p>

        <p>
            <strong>Concepto:</strong><br>
            Reserva #{{ $reserva->idReserva }} - {{ $persona->nombre }} {{ $persona->apellido1 }}
        </p>

        <hr>

        <p>
            Una vez hayas realizado la transferencia, entra en tu panel de cliente y pulsa el botón:
        </p>

        <p style="text-align:center; margin-top:30px;">

            <a href="http://tuweb.com/dashboard"
               style="
                    background:#2c7a7b;
                    color:white;
                    padding:14px 24px;
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
               ">
                Ir a mi Panel de Cliente
            </a>

        </p>

        <p style="margin-top:40px; color:#777;">
            Gracias por confiar en Hotel Rural.
        </p>

    </div>

</body>
</html>