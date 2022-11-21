<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Models\AppState;
use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\CorrectiveAction;
use App\Models\CorrectiveActionImages;
use App\Models\FailedPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class DevMenuController extends Controller
{
    private function resetCorrectiveAction($findingId)
    {
        $finding = AuditFinding::find($findingId);
        $finding->status = 0;
        $finding->save();

        $correctiveActions = CorrectiveAction::where('finding_id', $findingId);

        if (!$correctiveActions->exists()) {
            return;
        }

        $correctiveActions->get()->each(function ($ca) {
            $images = CorrectiveActionImages::where('ca_id', $ca->id);

            if (!$images->exists()) {
                return;
            }

            $imageFiles = $images->get()
                ->map(function ($image) { return public_path("ca_images/{$image['filename']}"); })
                ->filter(function ($imageFile) { return File::exists($imageFile); });

            File::delete($imageFiles->toArray());
            $images->delete();
        });

        $correctiveActions->delete();
    }

    public function apiResetCurrentCycle()
    {
        $currentCycle = AuditCycle::whereNull('close_date')->first();
        $currentCycle->total_findings = 0;
        $currentCycle->save();

        $records = AuditRecord::where('cycle_id', $currentCycle->id);
        $records->update(['auditor_id' => null, 'status' => 0]);

        foreach ($records->get() as $record) {
            $findings = AuditFinding::where('record_id', $record->id);

            foreach ($findings->get() as $finding) {
                $images = FailedPhoto::where('finding_id', $finding->id);

                $imageFiles = $images->get()
                    ->map(function ($image) {
                        return public_path("case_images/{$image['filename']}");
                    })
                    ->filter(function ($imageFile) {
                        return File::exists($imageFile);
                    });

                File::delete($imageFiles->toArray());
                $images->delete();

                $this->resetCorrectiveAction($finding->id);
            }

            $findings->delete();
        }

        return ['result' => 'ok'];
    }

    public function apiResetFindingsCounter()
    {
        AppStateHelpers::resetFindingsCounter();
        return ['result' => 'ok'];
    }

    public function apiResetCorrectiveAction($id)
    {
        $this->resetCorrectiveAction($id);
        return ['result' => 'ok'];
    }

    public function apiResetApproval($id)
    {
        $ca = CorrectiveAction::find($id);

        if (!$ca) {
            return ['result' => 'ok'];
        }

        $ca->closing_remarks = null;
        $ca->save();

        $ca->finding->status = 1;
        $ca->finding->save();

        return ['result' => 'ok'];
    }

    public function apiGetAppState()
    {
        return AppState::first();
    }

    public function apiUncancel($id)
    {
        $finding = AuditFinding::find($id);

        if ($finding->status == 2) {
            $finding->status = 0;
            $finding->cancel_reason = null;
        }

        $finding->save();

        return ['result' => 'ok'];
    }
}
