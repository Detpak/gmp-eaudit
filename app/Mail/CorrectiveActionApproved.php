<?php

namespace App\Mail;

use App\Models\CorrectiveAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CorrectiveActionApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $ca;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(CorrectiveAction $ca)
    {
        $this->ca = $ca;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->markdown('emails.corrective_action_approved')
                    ->subject("{$this->ca->finding->code} - Corrective Action approval for {$this->ca->finding->ca_name} ({$this->ca->created_at})")
                    ->with([
                        'ca' => $this->ca
                    ]);
    }
}
