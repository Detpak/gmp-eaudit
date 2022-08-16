<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentPIC;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    public function apiAddDepartment(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'code' => 'required|numeric|unique:departments,code',
                'pic_ids' => 'required'
            ],
            [
                'pic_ids.required' => 'The PIC(s) must be filled.'
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
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('code', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        return $query->select('id', 'name', 'code')->paginate($request->max);
    }

    public function apiDeleteDepartment($id)
    {
        DepartmentPIC::where('dept_id', $id)->delete();
        Department::find($id)->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteDepartments(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        Department::whereIn('id', $request->rowIds)->delete();

        return Response::json(['result' => 'ok']);
    }

    public function apiFetchOptions()
    {
        return Department::select('id', 'name')->get();
    }
}
