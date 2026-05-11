<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservaPendientePagoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reserva;
    public $persona;
    public $precio;

    public function __construct($reserva, $persona, $precio)
    {
        $this->reserva = $reserva;
        $this->persona = $persona;
        $this->precio = $precio;
    }

    public function build()
    {
        return $this->subject('Tu reserva está pendiente de pago')
                    ->view('emails.reserva_pendiente_pago');
    }
}
