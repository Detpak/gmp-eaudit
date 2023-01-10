<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Helpers\Filtering;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\Department;
use App\Models\DepartmentPIC;
use ArrayObject;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuditRecordController extends Controller
{
    public function apiDeptFetch(Request $request)
    {
        $query = Department::query();

        if ($request->search) {
            $query->where('audit_records.code', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%")
                ->orWhere('audit_cycles.cycle_id', "%{$request->search}%");
        }

        if ($request->cycle_id) {
            $query->orWhere('audit_records.cycle_id', 'LIKE', "%{$request->cycle_id}%");
        }

        $query->join('areas', 'areas.department_id', '=', 'departments.id')
              ->join('audit_records', 'audit_records.area_id', '=', 'areas.id')
              ->join('audit_cycles', 'audit_cycles.id', '=', 'audit_records.cycle_id')
              ->leftJoin('audit_findings', 'audit_findings.record_id', '=', 'audit_records.id')
              ->groupBy('departments.id', 'audit_cycles.id');

        $query->select('audit_cycles.cycle_id as cycle_id',
                       'departments.name as dept_name',
                       'departments.id',
                       'audit_cycles.start_date as date',
                       DB::raw('COUNT(audit_findings.id) as total_case_found'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 0 THEN 1 ELSE 0 END) as observation'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 1 THEN 1 ELSE 0 END) as minor_nc'),
                       DB::raw('SUM(CASE WHEN audit_findings.category = 2 THEN 1 ELSE 0 END) as major_nc'),
                       DB::raw('ROUND(AVG(audit_findings.ca_weight * audit_findings.weight_deduct) / 100, 2) as score_deduction'),
                       DB::raw('ROUND(100 - AVG(audit_findings.ca_weight * audit_findings.weight_deduct) / 100, 2) as score'));

        $query->with('pics', function ($query) {
            $query->select('name');
        });

        $query->withCount('areas');

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $query = Filtering::build($query, $request->filter_mode)
                ->whereString('audit_cycles.cycle_id', isset($filter->cycle_id) ? $filter->cycle_id : null)
                ->whereString('departments.name', isset($filter->dept_name) ? $filter->dept_name : null)
                ->having('total_case_found', isset($filter->total_case_found) ? $filter->total_case_found : null)
                ->having('observation', isset($filter->observation) ? $filter->observation : null)
                ->having('minor_nc', isset($filter->minor_nc) ? $filter->minor_nc : null)
                ->having('major_nc', isset($filter->major_nc) ? $filter->major_nc : null)
                ->having('score_deduction', isset($filter->score_deduction) ? $filter->score_deduction : null)
                ->having('score', isset($filter->score) ? $filter->score : null)
                ->having('date', isset($filter->date) ? $filter->date : null)
                ->done();
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('audit_cycles.id', 'desc');
        }

        return $request->has('max') ? $query->paginate($request->max) : $query->get();
    }

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
                       DB::raw('ROUND(SUM(audit_findings.ca_weight * audit_findings.weight_deduct) / 100, 2) as score_deduction'),
                       DB::raw('ROUND(100 - SUM(audit_findings.ca_weight * audit_findings.weight_deduct) / 100, 2) as score'))
              ->groupBy('audit_records.id');

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $mode = $request->filter_mode == 'any' ? 'or' : 'and';
            $query = Filtering::build($query, $request->filter_mode)
                ->whereString('audit_cycles.cycle_id', isset($filter->cycle_id) ? $filter->cycle_id : null)
                ->whereString('audit_records.code', isset($filter->code) ? $filter->code : null)
                ->whereString('departments.name', isset($filter->dept_name) ? $filter->dept_name : null)
                ->whereString('areas.name', isset($filter->area_name) ? $filter->area_name : null)
                ->whereString('users.name', isset($filter->auditor_name) ? $filter->auditor_name : null)
                ->having('total_case_found', isset($filter->total_case_found) ? $filter->total_case_found : null)
                ->having('observation', isset($filter->observation) ? $filter->observation : null)
                ->having('minor_nc', isset($filter->minor_nc) ? $filter->minor_nc : null)
                ->having('major_nc', isset($filter->major_nc) ? $filter->major_nc : null)
                ->having('total_weight', isset($filter->total_weight) ? $filter->total_weight : null)
                ->having('score_deduction', isset($filter->score_deduction) ? $filter->score_deduction : null)
                ->having('score', isset($filter->score) ? $filter->score : null)
                ->done();

            if (isset($filter->status->value)) {
                $statusId = collect([
                    'not started' => 0,
                    'in-progress' => 1,
                    'done' => 2
                ])->filter(function ($value, $key) use ($filter) { return Str::contains($key, Str::lower($filter->status->value)); });

                $query->whereIn('audit_records.status', $statusId, $mode);
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
