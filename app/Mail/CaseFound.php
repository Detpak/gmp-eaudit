<?php

namespace App\Mail;

use App\Models\Area;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CaseFound extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $auditee;
    protected $auditor;
    protected $area;
    protected $finding;
    protected $findingId;
    protected $images;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $auditor, Area $area, $finding, $findingId, $images)
    {

        $this->auditor = $auditor;
        $this->area = $area;
        $this->finding = $finding;
        $this->findingId = $findingId;
        $this->images = $images;
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
                        'auditor' => $this->auditor,
                        'area' => $this->area,
                        'finding' => $this->finding,
                        'findingId' => $this->findingId,
                        'images' => $this->images,
                    ]);
    }
}
