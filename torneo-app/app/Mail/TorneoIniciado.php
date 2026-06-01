<?php

namespace App\Mail;

use App\Models\Torneo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TorneoIniciado extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Torneo $torneo, public string $nombreUsuario) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🏆 {$this->torneo->nombre} — El torneo ha comenzado",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.torneo-iniciado',
        );
    }
}
