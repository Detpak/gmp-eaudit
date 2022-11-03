<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CorrectiveActionTaken extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $finding;
    protected $auditee;
    protected $desc;
    protected $caDate;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($finding, $auditee, $desc, $caDate)
    {
        $this->finding = $finding;
        $this->auditee = $auditee;
        $this->desc = $desc;
        $this->caDate = $caDate;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->markdown('emails.corrective_action_taken')
                    ->subject("{$this->finding->code} - Corrective Action for {$this->finding->ca_name} ({$this->caDate})")
                    ->with([
                        'finding' => $this->finding,
                        'auditee' => $this->auditee,
                        'desc' => $this->desc,
                        'caDate' => $this->caDate,
                    ]);
    }
}
