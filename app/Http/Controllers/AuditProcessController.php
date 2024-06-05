<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Helpers\Filtering;
use App\Mail\CaseFinding;
use App\Mail\CaseFound;
use App\Mail\CaseFindingCancelled;
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
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuditProcessController extends Controller
{
    private function getCaseFound($record)
    {
        return AuditFinding::select('audit_findings.ca_code')
            ->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
            ->join('areas', 'areas.id', '=', 'audit_records.area_id')
            ->join('departments', 'departments.id', '=', 'areas.department_id')
            ->where('audit_findings.record_id', $record)
            ->get()
            ->map(function ($value) {
                return $value->ca_code;
            });
    }

    public function apiValidateAudit(Request $request)
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
            ]
        );

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }
    }

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
            ]
        );

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $auditDate = Carbon::now();
        $cycle = AuditCycle::find($request->cycle_id);
        $finishDate = $cycle->finish_date->addDay();

        if ($auditDate > $finishDate) {
            return ['result' => 'error', 'msg' => 'Unable to continue audit process, the cycle period has ended.'];
        }

        $publicPath = public_path('case_images');

        // Check if the area has been audited
        $caseFound = $this->getCaseFound($request->record_id);
        $record = AuditRecord::select('id', 'code', 'status', 'area_id')->find($request->record_id);
        $criterias = CriteriaGroup::query()
            ->with('criterias', function ($query) use ($caseFound) {
                $query->whereNotIn('code', $caseFound);
            })
            ->find($cycle->cgroup_id)
            ->criterias;

        if ($criterias->count() == 0) {
            return [
                'formError' => [
                    'record_id' => ['This area has been auditted.']
                ],
            ];
        }

        // Filter passed criterias
        $failedCriteria = collect($wrap['findings'])
            ->filter(function ($value) {
                return $value['need_action'];
            })
            ->map(function ($value, $key) {
                return [...$value, 'case_id' => $key];
            });

        // Get failed criteria parameters
        $failedCriteriaIds = $failedCriteria->map(function ($value) {
            return $value['id'];
        });
        $failedCriteriaParams = Criteria::whereIn('id', $failedCriteriaIds)->get();

        if ($failedCriteriaParams->count() == 0 && $failedCriteriaParams->count() < $failedCriteriaIds->count()) {
            return ['result' => 'error', 'msg' => 'Criteria not found.'];
        }

        $criteriaGroup = CriteriaGroup::find($request->cgroup_id);

        // Reset findings count after a year.
        $lastAuditDate = AppStateHelpers::getState()->last_audit_date;
        if ($lastAuditDate != null && $lastAuditDate->year < $auditDate->year) {
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
            ->map(function ($value, $key) use ($criteriaGroup, $request, $lastNumberOfFindings, $auditDate) {
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

        // Update the number of total findings
        $cycle->total_findings += $failedCriteriaParams->count();

        // Update the area status to "In-Progress" or "Done" and set the auditor
        $tokenSplit = explode('|', $request->bearerToken()); // [0] = user id, [1] = token
        $record->status = $cycle->total_findings > 0 ? 1 : 2;
        $record->auditor_id = $tokenSplit[0];

        //dd($auditFindings->toArray());

        $imageFiles = null;
        $findingIds = [];
        try {
            foreach ($auditFindings as $value) {
                $tmpValue = $value;
                unset($tmpValue['case_id']);
                $findingIds[$value['case_id']] = AuditFinding::insertGetId($tmpValue);
            }

            $imageFiles = collect($request->file('images'))
                ->zip($request->imageIndexes)
                ->map(function ($file) use ($findingIds, $auditDate) {
                    $filename = $auditDate->valueOf() . '_' . Str::random(8) . '.' . $file[0]->getClientOriginalExtension();
                    return [
                        'file' => $file[0],
                        'filename' => $filename,
                        'finding_id' => $findingIds[$file[1]],
                        'case_id' => $file[1]
                    ];
                });

            if ($request->hasFile(('images'))) {
                FailedPhoto::insert(
                    $imageFiles->map(function ($file) use ($auditDate) {
                        return [
                            'filename' => $file['filename'],
                            'finding_id' => $file['finding_id'],
                            'created_at' => $auditDate->toDateTimeString(),
                            'updated_at' => $auditDate->toDateTimeString(),
                        ];
                    })
                        ->toArray()
                );
            }

            $imageFiles->each(function ($image) use ($publicPath) {
                $image['file']->move($publicPath, $image['filename']);
            });

            $record->save();
            $cycle->save();
            AppStateHelpers::advanceFindingsCounter($failedCriteriaParams->count(), $auditDate);
        } catch (\Throwable $th) {
            AuditFinding::where('record_id', $request->record_id)->delete();
            return [
                'result' => 'error',
                'msg' => 'An error occurred when submitting reports.',
                'details' => $th->getMessage()
            ];
        }

        if ($auditFindings->count() > 0) {
            $auditees = $record->area->department->pics;
            $auditor = User::find($request->auditor_id);
            foreach ($auditFindings->zip(array_values($findingIds)) as $finding) {
                $area = AuditRecord::find($finding[0]['record_id'])->area;
                $images = FailedPhoto::where('finding_id', $finding[1])->get();
                Mail::to($auditees)
                    ->cc($auditor)
                    ->send(new CaseFound($auditor, $area, $finding[0], $finding[1], $images));
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
                'findings' => AuditFinding::where('record_id', $request->record_id)->get(),
                'pics' => $record->area->department->pics,
                'images' => $imageFiles
                    ->groupBy('case_id')
                    ->map(function ($case) {
                        return $case->map(function ($image) {
                            return asset('case_images/' . $image['filename']);
                        });
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

        if ($request->dashboard) {
            $query->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
                ->join('audit_cycles', 'audit_cycles.id', '=', 'audit_records.cycle_id')
                ->join('areas', 'areas.id', '=', 'audit_records.area_id')
                ->join('departments', 'departments.id', '=', 'areas.department_id')
                ->select(
                    'audit_findings.id',
                    'audit_findings.code',
                    'audit_records.code as record_code',
                    'departments.name as department_name',
                    'areas.name as area_name',
                    'audit_findings.desc',
                    'audit_findings.status',
                    DB::raw("DATE_FORMAT(audit_findings.created_at, '%Y-%m-%d %T') as submit_date")
                )
                ->orderBy('audit_findings.created_at', 'desc');
            if ($request->cycle) {
                $cycle = json_decode($request->cycle);
                $query->where('audit_records.cycle_id', $cycle->id);
            }
            return $query->paginate($request->max);
        }

        $query->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
            ->join('audit_cycles', 'audit_cycles.id', '=', 'audit_records.cycle_id')
            ->join('areas', 'areas.id', '=', 'audit_records.area_id')
            ->join('departments', 'departments.id', '=', 'areas.department_id')
            ->select(
                'audit_findings.id',
                'audit_findings.record_id',
                'audit_findings.code',
                'audit_records.code as record_code',
                'audit_cycles.cycle_id',
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
                'audit_findings.cancel_reason',
                DB::raw("DATE_FORMAT(audit_findings.created_at, '%Y-%m-%d %T') as submit_date"),
                DB::raw('audit_findings.ca_weight * (audit_findings.weight_deduct / 100) as deducted_weight')
            );

        $query->addSelect([
            'has_auditee_id' => DepartmentPIC::select('user_id')
                ->whereColumn('dept_id', 'areas.department_id')
                ->where('user_id', $request->auth['user_id'])
                ->limit(1)
        ]);

        if ($request->search) {
            $query->where('audit_records.code', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_cycles.cycle_id', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%")
                ->orWhere('areas.name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.code', 'LIKE', "{$request->search}")
                ->orWhere('audit_findings.ca_name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.ca_weight', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_findings.cg_name', 'LIKE', "%{$request->search}%");
        }

        if ($request->cycle_id) {
            $query->orWhere('audit_records.cycle_id', 'LIKE', "%{$request->cycle_id}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        } else {
            $query->orderBy('audit_findings.id', 'desc');
        }

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $mode = $request->filter_mode == 'any' ? 'or' : 'and';
            $query = Filtering::build($query, $request->filter_mode)
                ->whereString('audit_cycles.cycle_id', isset($filter->cycle_id) ? $filter->cycle_id : null)
                ->whereString('audit_records.code', isset($filter->record_code) ? $filter->record_code : null)
                ->whereString('audit_findings.code', isset($filter->code) ? $filter->code : null)
                ->whereString('departments.name', isset($filter->department_name) ? $filter->department_name : null)
                ->whereString('areas.name', isset($filter->area_name) ? $filter->area_name : null)
                ->whereString('audit_findings.desc', isset($filter->desc) ? $filter->desc : null)
                ->whereString('audit_findings.cg_name', isset($filter->cg_name) ? $filter->cg_name : null)
                ->whereString('audit_findings.ca_name', isset($filter->ca_name) ? $filter->ca_name : null)
                ->where('audit_findings.ca_weight', isset($filter->ca_weight) ? $filter->ca_weight : null)
                ->having('deducted_weight', isset($filter->deducted_weight) ? $filter->deducted_weight : null)
                ->havingDateTime('submit_date', isset($filter->submit_date) ? $filter->submit_date : null)
                ->whereString('audit_findings.cancel_reason', isset($filter->cancel_reason) ? $filter->cancel_reason : null)
                ->done();

            if (isset($filter->status->value)) {
                $statusId = collect([
                    "new" => 0,
                    "resolved" => 1,
                    "cancelled" => 2,
                    "closed" => 3,
                ])->filter(function ($value, $key) use ($filter) {
                    return Str::contains($key, Str::lower($filter->status->value));
                });

                $query->whereIn('audit_findings.status', $statusId, $mode);
            }

            if (isset($filter->category->value)) {
                $categoryId = collect([
                    "observation" => 0,
                    "minor nc" => 1,
                    "major nc" => 2,
                ])->filter(function ($value, $key) use ($filter) {
                    return Str::contains($key, Str::lower($filter->category->value));
                });

                $query->whereIn('audit_findings.category', $categoryId, $mode);
            }
        }

        $query->withCount('images');

        return $request->max ? $query->paginate($request->max) : $query->get();
    }

    public function apiFetchImages($findingId)
    {
        return FailedPhoto::where('finding_id', $findingId)
            ->select('filename')
            ->get()
            ->map(function ($image) {
                return asset('case_images/' . $image['filename']);
            });
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

    public function apiCancel(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => 'required|exists:audit_findings,id',
                'reason' => 'nullable|max:65536'
            ]
        );

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $finding = null;

        try {
            $finding = AuditFinding::find($request->id);
            $finding->status = 2;
            $finding->cancel_reason = $request->reason;
            $finding->save();
        } catch (\Throwable $th) {
            return ['error' => 'Unable to cancel case finding.'];
        }

        $auditees = $finding->record->area->department->pics;
        Mail::to($auditees)
            ->cc($finding->auditor)
            ->send(new CaseFindingCancelled($finding));

        return ['result' => 'ok'];
    }

    public function apiGetRecordCases($record)
    {
        $caseFound = $this->getCaseFound($record);

        $cycle = AuditRecord::find($record)->cycle;
        $criterias = CriteriaGroup::query()
            ->with('criterias')
            ->find($cycle->cgroup_id)
            ->criterias
            ->map(function ($value) use ($caseFound) {
                $value->audited = $caseFound->contains($value->code);
                return $value;
            });

        return $criterias;
    }
}
