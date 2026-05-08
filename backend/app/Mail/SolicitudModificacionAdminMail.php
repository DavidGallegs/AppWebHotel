<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudModificacionAdminMail extends Mailable
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
            ->subject('Solicitud de modificación de reserva')
            ->view('emails.admin.modificacion');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Solicitud Modificacion Admin Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
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
