<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudCancelacionAdminMail extends Mailable
{
    use Queueable, SerializesModels;
    public $reserva;
    /**
     * Create a new message instance.
     */
    public function __construct($reserva)
    {
        $this->reserva = $reserva;
    }

    public function build()
    {
        return $this
            ->subject('Solicitud de cancelación de reserva')
            ->view('emails.admin.cancelacion');
    }
    

}
