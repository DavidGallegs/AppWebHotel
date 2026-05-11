<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;


class SolicitudModificacionReservaMail extends Mailable
{
    use Queueable, SerializesModels;
    public $reserva;
    public $datos;
    /**
     * Create a new message instance.
     */
    public function __construct($reserva, $datos)
    {
        $this->reserva = $reserva;
        $this->datos = $datos;
    }

    public function build()
    {
        return $this->subject('Solicitud de modificación de reserva')
                    ->view('emails.solicitud_modificacion');
    }

}
