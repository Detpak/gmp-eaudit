<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
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

        //Department::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEditDepartment(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $user = Department::find($request->id);

        if (!$user) {
            return Response::json(['result' => 'Data not found']);
        }

        $user->update($request->except('id'));

        return ['result' => 'ok'];
    }

    public function apiGetDepartment($id)
    {
        return Department::find($id)->makeHidden(['id', 'created_at', 'updated_at']);
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

        return $query->select('id', 'name', 'code')->paginate(25);
    }

    public function apiDeleteDepartment($id)
    {
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
}
