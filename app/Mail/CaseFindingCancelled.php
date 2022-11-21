<?php

namespace App\Mail;

use App\Models\Area;
use App\Models\AuditFinding;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CaseFindingCancelled extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $finding;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(AuditFinding $finding)
    {
        $this->finding = $finding;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $code = $this->finding->code;
        $name = $this->finding->ca_name;
        $date = $this->finding->created_at;
        return $this->markdown('emails.case_finding_cancelled')
                    ->subject("{$code} - Cancellation or {$name} ({$date})")
                    ->with([
                        'auditor' => $this->finding->record->auditor,
                        'area' => $this->finding->record->area,
                        'finding' => $this->finding,
                        'images' => $this->finding->images,
                    ]);
    }
}
