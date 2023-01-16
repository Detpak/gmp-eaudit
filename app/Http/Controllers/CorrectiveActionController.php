<?php

namespace App\Http\Controllers;

use App\Helpers\Filtering;
use App\Mail\CorrectiveActionApproved;
use App\Mail\CorrectiveActionTaken;
use App\Models\AuditFinding;
use App\Models\CorrectiveAction;
use App\Models\CorrectiveActionImages;
use App\Models\DepartmentPIC;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CorrectiveActionController extends Controller
{
    private function getCaseStatusError($status)
    {
        switch ($status) {
            case 0:
                break;
            case 1:
                return [
                    'result' => 'error',
                    'msg' => 'Unable to proceed corrective action. Corrective action for the desired case has been taken.'
                ];
            case 2:
                return [
                    'result' => 'error',
                    'msg' => 'Unable to proceed corrective action. The case has been cancelled by auditor.'
                ];
            case 3:
                return [
                    'result' => 'error',
                    'msg' => 'Unable to proceed corrective action. Corrective action for the desired case has been taken and closed.'
                ];
        }

        return null;
    }


    public function apiEnsureAuditeePrivilege(Request $request, $id)
    {
        $finding = AuditFinding::find($id);

        if (!$finding) {
            return [
                'result' => 'error',
                'msg' => 'Invalid case finding.',
            ];
        }

        $statusError = $this->getCaseStatusError($finding->status);
        if ($statusError) {
            return $statusError;
        }

        $department = $finding->record->area->department;
        $picExists = DepartmentPIC::where('dept_id', $department->id)
            ->where('user_id', $request->auth['user_id'])
            ->exists();

        if (!$picExists) {
            return [
                'result' => 'error',
                'msg' => 'You are not allowed to take corrective action for this case.',
            ];
        }

        return ['result' => 'ok'];
    }

    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'finding_id'    => 'required|exists:audit_findings,id',
                'desc'          => 'required|max:65536',
            ],
            [],
            [
                'desc'          => 'description'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $caDate = Carbon::now();
        $ca = null;

        $finding = AuditFinding::find($request->finding_id);
        $statusError = $this->getCaseStatusError($finding->status);

        if ($statusError) {
            return $statusError;
        }

        $images = collect();
        try {
            $ca = CorrectiveAction::create([
                'finding_id' => $request->finding_id,
                'auditee_id' => $request->auth['user_id'],
                'desc' => $request->desc
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $filename = $caDate->valueOf() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();
                    $image->move(public_path('ca_images'), $filename);
                    $images->add([
                        'ca_id' => $ca->id,
                        'filename' => $filename,
                        'created_at' => $caDate->toDateTimeString(),
                        'updated_at' => $caDate->toDateTimeString(),
                    ]);
                }
            }

            CorrectiveActionImages::insert($images->toArray());

            $finding->status = 1;
            $finding->save();
        } catch (\Throwable $th) {
            if ($ca) {
                $ca->delete();
            }

            return [
                'result' => 'error',
                'msg' => 'Error occurred, cannot insert corrective action data.',
                'details' => $th->getMessage()
            ];
        }

        $auditor = $finding->record->auditor;
        if ($auditor->email) {
            Mail::to($auditor->email)->send(
                new CorrectiveActionTaken($ca->id, $finding, $ca->auditee, $ca->desc, $images, $caDate->toDateTimeString()));
        }

        return [
            'result' => 'ok',
            'result_data' => [
                'images' => $images->toArray()
            ]
        ];
    }

    public function apiFetch(Request $request)
    {
        $query = CorrectiveAction::query();

        $query->join('audit_findings', 'audit_findings.id', '=', 'corrective_actions.finding_id')
              ->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
              ->join('audit_cycles', 'audit_cycles.id', '=', 'audit_records.cycle_id')
              ->join('areas', 'areas.id', '=', 'audit_records.area_id')
              ->join('users', 'users.id', '=', 'corrective_actions.auditee_id')
              ->select('corrective_actions.id',
                       'corrective_actions.desc',
                       'corrective_actions.closing_remarks',
                       DB::raw("DATE_FORMAT(corrective_actions.created_at, '%Y-%m-%d %T') as submit_date"),
                       'corrective_actions.close_date',
                       'areas.name as area_name',
                       'users.name as auditee',
                       'audit_cycles.cycle_id as cycle_id',
                       'audit_records.code as record_code',
                       'audit_findings.id as case_id',
                       'audit_findings.ca_name',
                       'audit_findings.ca_code',
                       'audit_findings.ca_weight',
                       'audit_findings.category',
                       'audit_findings.code',
                       'audit_findings.status',
                       DB::raw('audit_findings.ca_weight * (audit_findings.weight_deduct / 100) as deducted_weight'));

        if ($request->search) {
            $query->where('audit_findings.code', 'LIKE', "%{$request->search}%")
                  ->orWhere('audit_records.code', 'LIKE', "%{$request->search}%")
                  ->orWhere('audit_cycles.cycle_id', 'LIKE', "%{$request->search}%")
                  ->orWhere('areas.name', 'LIKE', "%{$request->search}%")
                  ->orWhere('users.name', 'LIKE', "%{$request->search}%")
                  ->orWhere('corrective_actions.desc', 'LIKE', "%{$request->search}%");
        }

        if ($request->cycle_id) {
            $query->orWhere('audit_records.cycle_id', 'LIKE', "%{$request->cycle_id}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('corrective_actions.id', 'desc');
        }

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $mode = $request->filter_mode == 'any' ? 'or' : 'and';
            $query = Filtering::build($query, $request->filter_mode)
                ->whereString('audit_cycles.cycle_id', isset($filter->cycle_id) ? $filter->cycle_id : null)
                ->whereString('audit_records.code', isset($filter->record_code) ? $filter->record_code : null)
                ->whereString('audit_findings.code', isset($filter->code) ? $filter->code : null)
                ->whereString('areas.name', isset($filter->area_name) ? $filter->area_name : null)
                ->whereString('users.name', isset($filter->auditee) ? $filter->auditee : null)
                ->whereString('corrective_actions.desc', isset($filter->desc) ? $filter->desc : null)
                ->whereString('audit_findings.cg_name', isset($filter->cg_name) ? $filter->cg_name : null)
                ->whereString('audit_findings.ca_name', isset($filter->ca_name) ? $filter->ca_name : null)
                ->where('audit_findings.ca_weight', isset($filter->ca_weight) ? $filter->ca_weight : null)
                ->having('deducted_weight', isset($filter->deducted_weight) ? $filter->deducted_weight : null)
                ->havingDateTime('submit_date', isset($filter->submit_date) ? $filter->submit_date : null)
                ->whereString('closing_remarks', isset($filter->closing_remarks) ? $filter->closing_remarks : null)
                ->done();

            if (isset($filter->status->value)) {
                $statusId = collect([
                    "new" => 1,
                    "closed" => 3,
                ])->filter(function ($value, $key) use ($filter) { return Str::contains($key, Str::lower($filter->status->value)); });

                $query->whereIn('audit_findings.status', $statusId, $mode);
            }

            if (isset($filter->category->value)) {
                $categoryId = collect([
                    "observation" => 0,
                    "minor nc" => 1,
                    "major nc" => 2,
                ])->filter(function ($value, $key) use ($filter) { return Str::contains($key, Str::lower($filter->category->value)); });

                $query->whereIn('audit_findings.category', $categoryId, $mode);
            }
        }

        $query->withCount('images');

        return $query->paginate($request->max);
    }

    public function apiFetchImages($id)
    {
        return CorrectiveActionImages::where('ca_id', $id)
            ->get()
            ->map(function ($image) {
                return asset("ca_images/{$image->filename}");
            });
    }

    public function apiGet($id)
    {
        $query = CorrectiveAction::query();

        $query->with('finding', function ($query) {
            $query->with('record', function ($query) {
                $query->with('area', function ($query) {
                    $query->with('department');
                });
            });
        });

        $query->with('auditee');
        $query->withCount('images');

        return $query->find($id);
    }

    public function apiClose(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'remarks'  => 'max:65536',
            ],
            [],
            [
                'remarks'  => 'remarks'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $ca = CorrectiveAction::find($request->id);

        if ($ca->finding->status == 3) {
            return [
                'result' => 'error',
                'msg' => 'Unable to close the corrective action. Corrective Action has been closed by auditor.'
            ];
        }

        try {
            $ca->closing_remarks = $request->remarks;
            $ca->close_date = Carbon::now();
            $ca->save();

            $ca->finding->status = 3;
            $ca->finding->save();
        } catch (\Throwable $th) {
            return [
                'result' => 'error',
                'msg' => 'An error occurred while closing the corrective action.'
            ];
        }

        $auditee = $ca->auditee;
        if ($auditee->email) {
            Mail::to($auditee->email)->send(new CorrectiveActionApproved($ca));
        }

        return ['result' => 'ok'];
    }
}
