<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;


class ReservaCanceladaMail extends Mailable
{
    use Queueable, SerializesModels;
    public $reserva;
    public $persona;
    /**
     * Create a new message instance.
     */
    public function __construct($reserva, $persona)
    {
        $this->reserva = $reserva;
        $this->persona = $persona;
    }

    public function build()
    {
        return $this->subject('Cancelación de tu reserva')
            ->view('emails.reserva_cancelada');
    }

    
}
