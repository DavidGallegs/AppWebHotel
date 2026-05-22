<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservaConfirmadaMail extends Mailable
{
    use Queueable, SerializesModels;
    public $reserva;

    /**
     * Create a new message instance.
     */

    /*
    | FUNCION CONSTRUCTORA PARA INICIALIZAR LA PROPIEDAD $reserva CON LA RESERVA CONFIRMADA.
    */
    public function __construct($reserva)
    {
        $this->reserva = $reserva;
    }

    /**
     * Get the message envelope.
     */

    /*
    | FUNCION ENVELOPE PARA DEFINIR EL ASUNTO DEL EMAIL.
    */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reserva Confirmada Mail',
        );
    }

    /**
     * Get the message content definition.
     */

    /*
    | FUNCION CONTENT PARA DEFINIR LA VISTA DEL EMAIL Y PASARLE LA RESERVA CONFIRMADA.
    */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reserva_confirmada',
            with: [
                'reserva' => $this->reserva,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
