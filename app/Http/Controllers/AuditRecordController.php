<?php

namespace App\Http\Controllers;

use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\DepartmentPIC;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditRecordController extends Controller
{
    public function apiFetch(Request $request)
    {
        $query = AuditRecord::query();

        if ($request->search) {
            $query->where('audit_records.code', 'LIKE', "%{$request->search}%")
                ->orWhere('areas.name', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%");
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
                       DB::raw('SUM(audit_findings.ca_weight) as total_weight'),
                       DB::raw('SUM(audit_findings.ca_weight * (audit_findings.weight_deduct / 100)) as total_net_weight'),
                       DB::raw('100 - SUM(audit_findings.ca_weight * (audit_findings.weight_deduct / 100)) as total_score'))
              ->groupBy('audit_records.id');

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
            $query->where('audit_records.cycle_id', $request->cycle)
                ->where('audit_records.status', 0);
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($request->max);
    }
}
