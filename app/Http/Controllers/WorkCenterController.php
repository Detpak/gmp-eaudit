<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class WorkCenterController extends Controller
{
    public function show()
    {
        return view('work_center');
    }

    public function apiAddDepartment(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'code' => 'required|numeric|unique:departments,code'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Department::create($request->except(['pic']));

        return ['result' => 'ok'];
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

        return $query->paginate(25);
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
