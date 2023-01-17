<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Helpers\UserHelpers;
use App\Models\AppState;
use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\CorrectiveAction;
use App\Models\CorrectiveActionImages;
use App\Models\FailedPhoto;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

    private function resetCycle($cycle)
    {
        $cycle->total_findings = 0;
        $cycle->save();

        $records = AuditRecord::where('cycle_id', $cycle->id);
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
    }

    public function apiResetCurrentCycle()
    {
        $currentCycle = AuditCycle::whereNull('close_date')->first();
        $this->resetCycle($currentCycle);

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
        $ca->close_date = null;
        $ca->save();

        $ca->finding->status = 1;
        $ca->finding->save();

        return ['result' => 'ok'];
    }

    public function apiResetAuditState()
    {
        DB::table('corrective_action_images')->delete();
        DB::statement("ALTER TABLE corrective_action_images AUTO_INCREMENT = 1");

        DB::table('corrective_actions')->delete();
        DB::statement("ALTER TABLE corrective_actions AUTO_INCREMENT = 1");

        DB::table('failed_photos')->delete();
        DB::statement("ALTER TABLE failed_photos AUTO_INCREMENT = 1");

        DB::table('audit_findings')->delete();
        DB::statement("ALTER TABLE audit_findings AUTO_INCREMENT = 1");

        DB::table('audit_records')->delete();
        DB::statement("ALTER TABLE audit_records AUTO_INCREMENT = 1");

        DB::table('audit_cycles')->delete();
        DB::statement("ALTER TABLE audit_cycles AUTO_INCREMENT = 1");

        $app_state = AppState::first();
        $app_state->current_cycle = 0;
        $app_state->num_findings = 0;
        $app_state->last_cycle_date = null;
        $app_state->last_audit_date = null;
        $app_state->save();

        return ['result' => 'ok'];
    }

    public function apiAuthTest(Request $request)
    {
        $validator = Validator::make($request->all(), ['password' => 'required|min:8']);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        if (!Hash::check($request->password, $request->user->password)) {
            return ['formError' => ['password' => ['Wrong password.']]];
        }

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
