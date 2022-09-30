<?php

namespace App\Http\Controllers;

use App\Models\AuditRecord;
use App\Models\DepartmentPIC;
use Illuminate\Http\Request;

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
              //->join('departments_pics', 'department_pics.dept_id', '=', '');
              ->select('audit_records.id',
                       'audit_records.area_id',
                       'audit_records.code',
                       'audit_records.status',
                       'areas.name as area_name',
                       'users.name as auditor_name',
                       'audit_cycles.cycle_id as cycle_id',
                       'departments.name as dept_name',
                       'departments.id as dept_id');

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
