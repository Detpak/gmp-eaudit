<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Helpers\Filtering;
use App\Models\Department;
use App\Models\DepartmentPIC;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function apiAddDepartment(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name'              => 'required|string|max:255',
                'code'              => 'required|numeric|unique:departments,code',
                'division_id'       => 'required|exists:divisions,id',
                'pic_ids'           => 'required'
            ],
            [
                'pic_ids.required'  => 'The PIC(s) must be filled.'
            ],
            [
                'division_id'       => 'division'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data = Department::create($request->except(['pic_ids']));

        $pics = Arr::map($request->pic_ids, function($id) use($data) {
            return ['dept_id' => $data->id, 'user_id' => $id];
        });

        DepartmentPIC::insert($pics);

        return ['result' => 'ok'];
    }

    public function apiEditDepartment(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Department::find($request->id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name'              => 'required|string|max:255',
                'code'              => ['required', 'numeric', Rule::unique('departments', 'code')->ignore($request->id)],
                'division_id'       => 'required|exists:divisions,id',
                'pic_ids'           => 'required'
            ],
            [
                'pic_ids.required'  => 'The PIC(s) must be filled.'
            ],
            [
                'division_id'       => 'division'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data->update($request->except('id'));

        // Delete existing PIC(s) and replace with the new one
        DepartmentPIC::where('dept_id', $request->id)->delete();

        $pics = Arr::map($request->pic_ids, function($id) use($data) {
            return ['dept_id' => $data->id, 'user_id' => $id];
        });

        DepartmentPIC::insert($pics);

        return ['result' => 'ok'];
    }

    public function apiGetDepartment($id)
    {
        $dept = Department::find($id);

        if (!$dept) {
            return Response::json(['result' => 'Data not found']);
        }

        $attr = collect($dept->makeHidden(['id', 'created_at', 'updated_at'])->toArray());

        $pic_ids = DepartmentPIC::select('user_id')
            ->where('dept_id', $id)
            ->get()
            ->map(function($value) {
                return "{$value['user_id']}";
            });

        return $attr->merge(['pic_ids' => $pic_ids]);
    }

    public function apiGetDepartmentPics($id)
    {
        return DepartmentPIC::select('user_id')
            ->where('dept_id', $id)
            ->get()
            ->map(function($value) {
                return "{$value['user_id']}";
            });
    }

    public function apiFetchDepartments(Request $request)
    {
        $query = Department::query();

        if ($request->search) {
            $query->where('departments.name', 'LIKE', "%{$request->search}%")
                ->orWhere('code', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('divisions', 'divisions.id', '=', 'departments.division_id')
            ->select('departments.id',
                     'departments.name',
                     'departments.code',
                     'divisions.name as division_name');

        if (!$request->list) {
            $query->with('pics', function ($query) {
                 $query->select('name')
                     ->orderBy('name');
            });
        }

        $query->withCount('areas');

        if ($request->filter) {
            $filter = json_decode($request->filter);
            $query = Filtering::build($query, $request->filter_mode)
                ->whereString('departments.name', isset($filter->name) ? $filter->name : null)
                ->whereString('departments.code', isset($filter->code) ? $filter->code : null)
                ->whereString('division_name', isset($filter->division_name) ? $filter->division_name : null)
                ->having('areas_count', isset($filter->areas_count) ? $filter->areas_count : null)
                ->done();
        }

        return $query->paginate($request->max);
    }

    public function apiDeleteDepartment($id)
    {
        $department = Department::withCount('areas')->find($id);

        if ($department->areas_count > 0) {
            $subject = CommonHelpers::getSubjectWord($department->areas_count);
            return ['error' => "Cannot delete department. There {$subject} {$department->areas_count} registered area(s) under the deparment."];
        }

        DepartmentPIC::where('dept_id', $id)->delete();
        $department->delete();

        return ['result' => 'ok'];
    }

    public function apiDeleteDepartments(Request $request)
    {
        if (!$request->rowIds) {
            return Response::json(['result' => 'error'], 404);
        }

        $departments = Department::withCount('areas')->whereIn('id', $request->rowIds);
        $errorCount = 0;

        foreach ($departments->get() as $department) {
            if ($department->areas_count > 0) {
                $errorCount += $department->areas_count;
            }
        }

        if ($errorCount > 0) {
            $subject = CommonHelpers::getSubjectWord($errorCount);
            return ['error' => "Cannot delete departments. There {$subject} {$errorCount} registered area(s) under some departments."];
        }

        DepartmentPIC::whereIn('dept_id', $request->rowIds)->delete();
        $departments->delete();

        return ['result' => 'ok'];
    }

    public function apiFetchOptions()
    {
        return Department::select('id', 'name')->get();
    }
}
