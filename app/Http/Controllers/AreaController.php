<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class AreaController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'desc' => 'nullable|string|max:255',
                'department_id' => 'required|exists:departments,id'
            ],
            [],
            [
                'desc' => 'description',
                'department_id' => 'department'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Area::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEdit(Request $request)
    {
        $validator = Validator::make(
            $request->except('id'),
            [
                'name' => 'required|string|max:255',
                'desc' => 'nullable|string|max:255',
                'department_id' => 'required|exists:departments,id'
            ],
            [],
            [
                'desc' => 'description',
                'department_id' => 'department'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data = Area::find($request->id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        $data->update($request->except('id'));

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $dept = Area::find($id);

        if (!$dept) {
            return Response::json(['result' => 'Data not found']);
        }

        return $dept->makeHidden(['id', 'created_at', 'updated_at']);
    }

    public function apiFetch(Request $request)
    {
        $query = Area::query();

        if ($request->search) {
            $query->where('areas.name', 'LIKE', "%{$request->search}%")
                ->orWhere('areas.desc', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('departments', 'departments.id', '=', 'areas.department_id')
            ->select('areas.id',
                     'areas.name',
                     'areas.desc',
                     'departments.name as dept_name');

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        Area::find($id)->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        Area::whereIn('id', $request->rowIds)->delete();

        return Response::json(['result' => 'ok']);
    }
}
