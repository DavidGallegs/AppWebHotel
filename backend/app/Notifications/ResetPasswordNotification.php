<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    protected $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . '/resetPassword?token=' . $this->token . '&email=' . $notifiable->getEmailForPasswordReset();

        return (new MailMessage)
            ->subject('Restablecimiento de contraseña')
            ->greeting('Hola ' . $notifiable->nombre . ',')
            ->line('Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.')
            ->action('Restablecer contraseña', $url)
            ->line('Este enlace expirará en 60 minutos.')
            ->line('Si no solicitaste este cambio, puedes ignorar este correo.')
            ->salutation('Hotel Rural');
    }
}