<?php

namespace App\Http\Controllers;

use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\Criteria;
use App\Models\CriteriaGroup;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use stdClass;

class AuditProcessController extends Controller
{
    public function apiSubmitAudit(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'cycle_id'                          => 'required|exists:audit_cycles,id',
                'record_id'                         => 'required|exists:audit_records,id',
                'cgroup_id'                         => 'required|exists:criteria_groups,id',
                'criteria_passes.*.info'            => 'required_if:criteria_passes.*.fail,true',
                'criteria_passes.*.info.category'   => ['required_if:criteria_passes.*.fail,true', Rule::in([0, 1, 2])],
                'criteria_passes.*.info.desc'       => 'required_if:criteria_passes.*.fail,true|max:65536'
            ],
            [
                'criteria_passes.*.info.desc.required_if' => 'Description must be filled'
            ],
            [
                'record_id' => 'area'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        // Check if the audit is not started
        $record = AuditRecord::select('id', 'status')->find($request->record_id);
        if ($record->status > 0) {
            return [
                'formError' => [
                    'record_id' => ['Cannot submit audit. The area has been submitted previously.']
                ],
            ];
        }

        // Filter passed criterias
        $failedCriteria = collect($request->criteria_passes)
            ->filter(function ($value) {
                return $value['fail'];
            });

        // Get failed criteria parameters
        $failedCriteriaIds = $failedCriteria->map(function ($value) { return $value['id']; });
        $failedCriteriaParams = Criteria::whereIn('id', $failedCriteriaIds)->get();

        if ($failedCriteriaParams->count() == 0 && $failedCriteriaParams->count() < $failedCriteriaIds->count()) {
            return ['result' => 'error', 'msg' => 'Criteria not found.'];
        }

        $criteriaGroup = CriteriaGroup::find($request->cgroup_id);
        $cycle = AuditCycle::select('id', 'total_findings')->find($request->cycle_id);
        $totalFindings = $cycle->total_findings;

        // Create audit findings data
        $auditFindings = $failedCriteria->zip($failedCriteriaParams)
            ->map(function ($value, $key) use($criteriaGroup, $request, $totalFindings) {
                $code = str_pad($totalFindings + $key + 1, 4, "0", STR_PAD_LEFT);
                return [
                    'code' => "GMP/2201/{$code}",
                    'record_id' => $request->record_id,
                    'ca_name' => $value[1]->name,
                    'ca_code' => $value[1]->code,
                    'ca_weight' => $value[1]->weight,
                    'cg_name' => $criteriaGroup->name,
                    'cg_code' => $criteriaGroup->code,
                    'category' => $value[0]['info']['category'],
                    'desc' => $value[0]['info']['desc'],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];
            });

        // Update the number of total findings
        $totalFindings += $failedCriteriaParams->count();
        $cycle->total_findings = $totalFindings;

        // Update the area status to "In-Progress" and set the auditor
        $tokenSplit = explode('|', $request->bearerToken()); // [0] = user id, [1] = token
        $record->status = $totalFindings > 0 ? 1 : 2;
        $record->auditor_id = $tokenSplit[0];

        try {
            AuditFinding::insert($auditFindings->toArray());
            $record->save();
            $cycle->save();
        } catch (\Throwable $th) {
            return ['result' => 'error', 'msg' => 'An error occurred when submitting reports.', 'details' => $th->getMessage()];
        }

        return ['result' => 'ok', 'request' => $request->all(), 'total_findings' => $totalFindings, 'findings' => $auditFindings, 'cycle' => $cycle];
    }

    public function apiFetch(Request $request)
    {
        $query = AuditFinding::query();

        $query->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
              ->join('areas', 'areas.id', '=', 'audit_records.area_id')
              ->select('audit_records.code as record_code',
                       'audit_findings.code',
                       'areas.name as area_name',
                       'audit_findings.desc',
                       'audit_findings.ca_name',
                       'audit_findings.ca_code',
                       'audit_findings.ca_weight',
                       'audit_findings.cg_name',
                       'audit_findings.cg_code');

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('audit_records.id', 'desc');
        }

        return $query->paginate($request->max);
    }
}
