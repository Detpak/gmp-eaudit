<?php

namespace App\Mail;

use App\Models\Area;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CaseFound extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $auditee;
    protected $auditor;
    protected $area;
    protected $finding;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $auditee, User $auditor, Area $area, $finding)
    {
        $this->auditee = $auditee;
        $this->auditor = $auditor;
        $this->area = $area;
        $this->finding = $finding;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $code = $this->finding['code'];
        $name = $this->finding['ca_name'];
        $date = $this->finding['created_at'];
        return $this->markdown('emails.case_found')
                    ->subject("{$code} - {$name} ({$date})")
                    ->with([
                        'auditee' => $this->auditee,
                        'auditor' => $this->auditor,
                        'area' => $this->area,
                        'finding' => $this->finding
                    ]);
    }
}
