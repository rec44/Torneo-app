<?php

namespace App\Mail;

use App\Models\Partido;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FechaPartidoActualizada extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Partido $partido,
        public string  $nombreUsuario,
        public string  $nombreEquipoPropio,
        public string  $nombreEquipoRival,
    ) {}

    public function envelope(): Envelope
    {
        $eq1 = $this->partido->equipo1?->nombre ?? 'Por definir';
        $eq2 = $this->partido->equipo2?->nombre ?? 'Por definir';

        return new Envelope(
            subject: "📆 Fecha actualizada: {$eq1} vs {$eq2} — {$this->partido->torneo->nombre}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.fecha-partido-actualizada',
        );
    }
}
