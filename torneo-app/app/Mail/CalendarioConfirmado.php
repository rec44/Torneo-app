<?php

namespace App\Mail;

use App\Models\Torneo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CalendarioConfirmado extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Torneo $torneo, public string $nombreUsuario) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "📅 Calendario confirmado — {$this->torneo->nombre}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.calendario-confirmado',
        );
    }
}
