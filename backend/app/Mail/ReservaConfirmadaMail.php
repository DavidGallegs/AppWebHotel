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

    /**
     * Create a new message instance.
     */

    //Funcion para recibir la reserva confirmada y pasarla a la vista del email.
    public function __construct($reserva)
    {
        $this->reserva = $reserva;
    }

    /**
     * Get the message envelope.
     */

    //Funcion envelope para definir el asunto del email.
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reserva Confirmada Mail',
        );
    }

    /**
     * Get the message content definition.
     */

    //Funcion content para definir la vista del email y pasarle la reserva confirmada.
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
