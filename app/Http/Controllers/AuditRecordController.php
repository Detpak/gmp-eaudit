<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\DepartmentPIC;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuditRecordController extends Controller
{
    public function apiFetch(Request $request)
    {
        $query = AuditRecord::query();

        if ($request->search) {
            $query->where('audit_records.code', 'LIKE', "%{$request->search}%")
                ->orWhere('areas.name', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%")
                ->orWhere('users.name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_cycles.cycle_id', "%{$request->search}%");
        }

        if ($request->cycle_id) {
            $query->orWhere('audit_records.cycle_id', 'LIKE', "%{$request->cycle_id}%");
        }

        $query->join('areas', 'areas.id', '=', 'audit_records.area_id')
              ->join('departments', 'departments.id', '=', 'areas.department_id')
              ->join('audit_cycles', 'audit_cycles.id', '=', 'audit_records.cycle_id')
              ->leftJoin('users', 'users.id', '=', 'audit_records.auditor_id')
              ->leftJoin('audit_findings', 'audit_findings.record_id', '=', 'audit_records.id')
              //->join('departments_pics', 'department_pics.dept_id', '=', '');
              ->select('audit_records.id',
                       'audit_records.area_id',
                       'audit_records.code',
                       'audit_records.status',
                       'areas.name as area_name',
                       'users.name as auditor_name',
                       'audit_cycles.cycle_id as cycle_id',
                       'departments.name as dept_name',
                       'departments.id as dept_id',
                       DB::raw('COUNT(audit_findings.id) as total_case_found'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 0 THEN 1 ELSE 0 END) as observation'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 1 THEN 1 ELSE 0 END) as minor_nc'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 2 THEN 1 ELSE 0 END) as major_nc'),
                       DB::raw('SUM(audit_findings.ca_weight) as total_weight'),
                       DB::raw('SUM(audit_findings.ca_weight * (audit_findings.weight_deduct / 100)) as score_deduction'),
                       DB::raw('100 - SUM(audit_findings.ca_weight * (audit_findings.weight_deduct / 100)) as score'))
              ->groupBy('audit_records.id');

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $mode = $request->filter_mode == 'any' ? 'or' : 'and';

            if (isset($filter->cycle_id->value)) {
                $query->where('audit_cycles.cycle_id', 'LIKE', "%{$filter->cycle_id->value}%", $mode);
            }

            if (isset($filter->code->value)) {
                $query->where('audit_records.code', 'LIKE', "%{$filter->code->value}%", $mode);
            }

            if (isset($filter->dept_name->value)) {
                $query->where('departments.name', 'LIKE', "%{$filter->dept_name->value}%", $mode);
            }

            if (isset($filter->area_name->value)) {
                $query->where('areas.name', 'LIKE', "%{$filter->area_name->value}%", $mode);
            }

            if (isset($filter->status->value)) {
                $statusId = collect([
                    'not started' => 0,
                    'in-progress' => 1,
                    'done' => 2
                ])->filter(function ($value, $key) use ($filter) { return Str::contains($key, Str::lower($filter->status->value)); });

                $query->whereIn('audit_records.status', $statusId, $mode);
            }

            if (isset($filter->auditor_name->value)) {
                $query->where('users.name', 'LIKE', "%{$filter->auditor_name->value}%", $mode);
            }

            if (isset($filter->total_case_found->value)) {
                $query->having('total_case_found', $filter->total_case_found->op, $filter->total_case_found->value, $mode);
            }

            if (isset($filter->observation->value)) {
                $query->having('observation', $filter->observation->op, $filter->observation->value, $mode);
            }

            if (isset($filter->minor_nc->value)) {
                $query->having("minor_nc", $filter->minor_nc->op, $filter->minor_nc->value, $mode);
            }

            if (isset($filter->major_nc->value)) {
                $query->having("major_nc", $filter->major_nc->op, $filter->major_nc->value, $mode);
            }

            if (isset($filter->total_weight->value)) {
                $query->having("total_weight", $filter->total_weight->op, $filter->total_weight->value, $mode);
            }

            if (isset($filter->score_deduction->value)) {
                $query->having("score_deduction", $filter->score_deduction->op, $filter->score_deduction->value, $mode);
            }

            if (isset($filter->score->value)) {
                $query->having("score", $filter->score->op, $filter->score->value, $mode);
            }
        }

        if (!$request->list) {
            $query->with('area', function ($query) {
                $query->select('id', 'name', 'department_id');
                $query->with('department', function ($query) {
                    $query->select('id');
                    $query->with('pics', function ($query) {
                        $query->select('name');
                    });
                });
            });
        }

        if ($request->cycle) {
            $query->where('audit_records.cycle_id', $request->cycle);
        }

        if ($request->dept) {
            $query->where('departments.id', $request->dept);
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $request->has('max') ? $query->paginate($request->max) : $query->get();
    }
}
