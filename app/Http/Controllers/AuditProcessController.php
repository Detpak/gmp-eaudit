<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Mail\AuditSubmitted;
use App\Mail\CaseFinding;
use App\Mail\CaseFound;
use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\Criteria;
use App\Models\CriteriaGroup;
use App\Models\DepartmentPIC;
use App\Models\FailedPhoto;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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

        $auditDate = Carbon::now();
        $publicPath = public_path('case_images');
        $files = [];

        if ($request->hasFile(('images'))) {
            foreach ($request->file('images') as $file) {
                $date = Carbon::now();
                $filename = $date->valueOf() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
                $file->move($publicPath, $filename);
                $files[] = ['filename' => $filename, 'date' => $date->toDateString()];
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

        // Get failed criteria parameters
        $failedCriteriaIds = $failedCriteria->map(function ($value) { return $value['id']; });
        $failedCriteriaParams = Criteria::whereIn('id', $failedCriteriaIds)->get();

        if ($failedCriteriaParams->count() == 0 && $failedCriteriaParams->count() < $failedCriteriaIds->count()) {
            return ['result' => 'error', 'msg' => 'Criteria not found.'];
        }

        $criteriaGroup = CriteriaGroup::find($request->cgroup_id);
        $cycle = AuditCycle::select('id', 'cycle_id', 'total_findings')->find($request->cycle_id);

        // Reset findings count after a year.
        if (AppStateHelpers::getState()->updated_at->year < Carbon::now()->year) {
            try {
                AppStateHelpers::resetFindingsCounter();
            } catch (\Throwable $th) {
                return [
                    'result' => 'error',
                    'msg' => 'Cannot reset finding count',
                    'details' => $th->getMessage()
                ];
            }
        }

        $lastNumberOfFindings = AppStateHelpers::getFindingsCount();

        // Create audit findings data
        $auditFindings = $failedCriteria
            ->zip($failedCriteriaParams)
            ->map(function ($value, $key) use($criteriaGroup, $request, $lastNumberOfFindings, $auditDate) {
                $code = str_pad($lastNumberOfFindings + $key + 1, 4, "0", STR_PAD_LEFT);
                $category = $value[0]['category'];
                return [
                    'code' => "CID/{$auditDate->format('y')}/{$code}",
                    'record_id' => $request->record_id,
                    'ca_name' => $value[1]->name,
                    'ca_code' => $value[1]->code,
                    'ca_weight' => $value[1]->weight,
                    'cg_name' => $criteriaGroup->name,
                    'cg_code' => $criteriaGroup->code,
                    'category' => $category,
                    'weight_deduct' => [0, 50, 100][$category],
                    'desc' => $value[0]['desc'],
                    'created_at' => $auditDate->toDateTimeString(),
                    'updated_at' => $auditDate->toDateTimeString(),
                    'case_id' => $value[0]['case_id']
                ];
            });

        // Create image data
        $casePhotos = collect($files)
            ->zip($request->imageIndexes)
            ->map(function ($value) {
                return [
                    'filename' => $value[0]['filename'],
                    'case_id' => $value[1],
                    'created_at' => $value[0]['date'],
                    'updated_at' => $value[0]['date']
                ];
            });

        // Update the number of total findings
        $cycle->total_findings += $failedCriteriaParams->count();

        // Update the area status to "In-Progress" or "Done" and set the auditor
        $tokenSplit = explode('|', $request->bearerToken()); // [0] = user id, [1] = token
        $record->status = $cycle->total_findings > 0 ? 1 : 2;
        $record->auditor_id = $tokenSplit[0];

        //dd($auditFindings->toArray());

        $findingIds = [];
        try {
            foreach ($auditFindings as $value) {
                $tmpValue = $value;
                unset($tmpValue['case_id']);
                $findingIds[$value['case_id']] = AuditFinding::insertGetId($tmpValue);
            }

            // Set where the image belongs to the finding
            $images = $casePhotos
                ->map(function ($value) use ($findingIds) {
                    return [
                        'filename' => $value['filename'],
                        'finding_id' => $findingIds[$value['case_id']],
                        'created_at' => $value['created_at'],
                        'updated_at' => $value['updated_at'],
                    ];
                })
                ->toArray();

            FailedPhoto::insert($images);
            $record->save();
            $cycle->save();
            AppStateHelpers::advanceFindingsCounter($failedCriteriaParams->count());
        }
        catch (\Throwable $th) {
            //AuditFinding::where('record_id', $request->record_id)->delete();
            return [
                'result' => 'error',
                'msg' => 'An error occurred when submitting reports.',
                'details' => $th->getMessage()
            ];
        }

        if ($auditFindings->count() > 0) {
            $auditees = $record->area->department->pics;
            $auditor = User::find($request->auditor_id);
            foreach ($auditFindings as $finding) {
                $area = AuditRecord::find($finding['record_id'])->area;
                foreach ($auditees as $auditee) {
                    Mail::to($auditee)->send(new CaseFound($auditee, $auditor, $area, $finding));
                }
            }
        }

        return [
            'result' => 'ok',
            'result_data' => [
                'cycle_id' => $cycle->cycle_id,
                'record_code' => $record->code,
                'area_name' => $record->area->name,
                'dept_name' => $record->area->department->name,
                'num_criterias' => $criteriaGroup->criterias->count(),
                'findings' => $auditFindings,
                'pics' => $record->area->department->pics,
                'images' => $casePhotos
                    ->groupBy('case_id')
                    ->map(function ($case) {
                        return $case->map(function ($image) { return asset('case_images/' . $image['filename']); });
                    })
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
              ->join('departments', 'departments.id', '=', 'areas.department_id')
              ->select('audit_findings.id',
                       'audit_findings.record_id',
                       'audit_findings.code',
                       'audit_records.code as record_code',
                       'departments.name as department_name',
                       'areas.name as area_name',
                       'audit_findings.desc',
                       'audit_findings.category',
                       'audit_findings.ca_name',
                       'audit_findings.ca_code',
                       'audit_findings.ca_weight',
                       'audit_findings.cg_name',
                       'audit_findings.cg_code',
                       'audit_findings.status',
                       'audit_findings.status',
                       'audit_findings.cancel_reason',
                       DB::raw('audit_findings.ca_weight * (audit_findings.weight_deduct / 100) as deducted_weight'));

        $query->addSelect([
            'auditee_id' => DepartmentPIC::select('user_id')
                ->whereColumn('dept_id', 'areas.department_id')
                ->where('user_id', $request->auth['user_id'])
                ->limit(1)
        ]);

        if ($request->search) {
            $query->where('audit_records.code', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%")
                ->orWhere('areas.name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.code', 'LIKE', "{$request->search}")
                ->orWhere('audit_findings.ca_name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.ca_weight', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.cg_name', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('audit_records.id', 'asc');
        }

        $query->withCount('images');

        return $query->paginate($request->max);
    }

    public function apiFetchImages($findingId)
    {
        return FailedPhoto::where('finding_id', $findingId)
            ->select('filename')
            ->get()
            ->map(function ($image) { return asset('case_images/' . $image['filename']); });
    }

    public function apiGet($id)
    {
        $query = AuditFinding::query();

        $query->with('record', function ($query) {
            $query->select('id', 'auditor_id', 'area_id', 'code');

            $query->with('auditor', function ($query) {
                $query->select('id', 'name');
            });

            $query->with('area', function ($query) {
                $query->select('id', 'department_id', 'name');
                $query->with('department');
            });
        });

        return $query->find($id);
    }
}
