<?php

namespace App\Http\Controllers;

use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\Criteria;
use App\Models\CriteriaGroup;
use App\Models\FailedPhoto;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use stdClass;

class AuditProcessController extends Controller
{
    public function apiSubmitAudit(Request $request)
    {
        $wrap = [
            'cycle_id' => $request->cycle_id,
            'auditor_id' => $request->auditor_id,
            'record_id' => $request->record_id,
            'cgroup_id' => $request->cgroup_id,
            'findings' => json_decode($request->findings, true)
        ];

        $validator = Validator::make(
            $wrap,
            [
                'cycle_id'                      => 'required|exists:audit_cycles,id',
                'auditor_id'                    => 'required|exists:users,id',
                'record_id'                     => 'required|exists:audit_records,id',
                'cgroup_id'                     => 'required|exists:criteria_groups,id',
                'findings.*.category'           => ['required_if:findings.*.need_action,true', Rule::in([0, 1, 2])],
                'findings.*.desc'               => 'required_if:findings.*.need_action,true|max:65536'
            ],
            [
                'findings.*.desc.required_if'   => 'Description must be filled'
            ],
            [
                'record_id' => 'area'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $publicPath = public_path('case_images');
        $files = [];

        if ($request->hasFile(('images'))) {
            foreach ($request->file('images') as $file) {
                $date = Carbon::now();
                $filename = $date->valueOf() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
                $file->move($publicPath, $filename);
                $files[] = ['filename' => $filename, 'date' => $date];
            }
        }

        // Check if the audit is not started
        $record = AuditRecord::select('id', 'code', 'status', 'area_id')->find($request->record_id);
        if ($record->status > 0) {
            return [
                'formError' => [
                    'record_id' => ['Cannot submit audit. The area has been auditted previously.']
                ],
            ];
        }

        // Filter passed criterias
        $failedCriteria = collect($wrap['findings'])
            ->filter(function ($value) { return $value['need_action']; })
            ->map(function ($value, $key) { return [...$value, 'case_id' => $key]; } );

        //dd($failedCriteria);

        // Get failed criteria parameters
        $failedCriteriaIds = $failedCriteria->map(function ($value) { return $value['id']; });
        $failedCriteriaParams = Criteria::whereIn('id', $failedCriteriaIds)->get();

        if ($failedCriteriaParams->count() == 0 && $failedCriteriaParams->count() < $failedCriteriaIds->count()) {
            return ['result' => 'error', 'msg' => 'Criteria not found.'];
        }

        $criteriaGroup = CriteriaGroup::find($request->cgroup_id);
        $cycle = AuditCycle::select('id', 'cycle_id', 'total_findings')->find($request->cycle_id);
        $totalFindings = $cycle->total_findings;

        // Create audit findings data
        $auditFindings = $failedCriteria
            ->zip($failedCriteriaParams)
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
                    'category' => $value[0]['category'],
                    'desc' => $value[0]['desc'],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                    'case_id' => $value[0]['case_id']
                ];
            });

        $casePhotos = collect($files)
            ->zip($request->imageIndexes)
            ->map(function ($value) use($request) {
                return [
                    'filename' => $value[0]['filename'],
                    'record_id' => $request->record_id,
                    'case_id' => $value[1],
                    'created_at' => $value[0]['date'],
                    'updated_at' => $value[0]['date']
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
            //FailedPhoto::insert($casePhotos->toArray());
            //AuditFinding::insert($auditFindings->toArray());
            //$record->save();
            //$cycle->save();
        } catch (\Throwable $th) {
            return ['result' => 'error', 'msg' => 'An error occurred when submitting reports.', 'details' => $th->getMessage()];
        }

        return [
            'result' => 'ok',
            'failed_ids' => $failedCriteriaIds,
            'failed_params' => $failedCriteriaParams,
            'failed_case' => $failedCriteria,
            'result_data' => [
                'cycle_id' => $cycle->cycle_id,
                'record_code' => $record->code,
                'area_name' => $record->area->name,
                'dept_name' => $record->area->department->name,
                'num_criterias' => $criteriaGroup->criterias->count(),
                'findings' => $auditFindings,
                'images' => $casePhotos
                    ->map(function ($value) {
                        return [
                            'case_id' => $value['case_id'],
                            'file' => asset('case_images/' . $value['filename'])
                        ];
                    })
                    ->groupBy('case_id'),
            ]
        ];
    }

    public function apiSubmitImages(Request $request)
    {
        return ['result' => 'ok'];
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
