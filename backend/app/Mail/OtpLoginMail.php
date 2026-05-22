<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpLoginMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public $otp) {}

    public function build()
    {
        return $this->subject('Código de acceso')
            ->view('emails.otp_login');
    }
}
