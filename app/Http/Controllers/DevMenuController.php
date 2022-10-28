<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Models\AppState;
use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\FailedPhoto;
use Illuminate\Http\Request;

class DevMenuController extends Controller
{
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
                FailedPhoto::where('finding_id', $finding->id)->delete();
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

    public function apiGetAppState()
    {
        return AppState::first();
    }
}
