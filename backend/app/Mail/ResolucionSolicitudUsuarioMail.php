<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResolucionSolicitudUsuarioMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reserva;
    public $tipo;
    /**
     * Create a new message instance.
     */
    public function __construct($reserva, $tipo)
    {
        $this->reserva = $reserva;
        $this->tipo = $tipo;
    }
    
    public function build()
    {
        return $this
            ->subject('Resolución de solicitud de reserva')
            ->view('emails.user.resolucion');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Resolucion Solicitud Usuario Mail',
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
