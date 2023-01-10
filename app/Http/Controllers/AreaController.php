<?php

namespace App\Http\Controllers;

use App\Helpers\Filtering;
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
                'plant_id' => 'required|exists:plants,id',
                'department_id' => 'required|exists:departments,id'
            ],
            [],
            [
                'desc' => 'description',
                'plant_id' => 'plant',
                'department_id' => 'department',
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
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'desc' => 'nullable|string|max:255',
                'plant_id' => 'required|exists:plants,id',
                'department_id' => 'required|exists:departments,id'
            ],
            [],
            [
                'desc' => 'description',
                'plant_id' => 'plant',
                'department_id' => 'department',
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
                ->orWhere('plants.name', 'LIKE', "%{$request->search}%")
                ->orWhere('departments.name', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('departments', 'departments.id', '=', 'areas.department_id')
            ->leftJoin('plants', 'plants.id', '=', 'areas.plant_id')
            ->select('areas.id',
                     'areas.name',
                     'areas.desc',
                     'areas.department_id',
                     'plants.name as plant_name',
                     'plants.code as plant_code',
                     'departments.name as dept_name');

        $filter = json_decode($request->filter);
        $query = Filtering::build($query, $request->filter_mode)
            ->whereString('areas.name', isset($filter->name) ? $filter->name : null)
            ->whereString('plant_name', isset($filter->plant_name) ? $filter->plant_name : null)
            ->whereString('dept_name', isset($filter->dept_name) ? $filter->dept_name : null)
            ->whereString('areas.desc', isset($filter->desc) ? $filter->desc : null)
            ->done();

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        try {
            Area::find($id)->delete();
        } catch (\Throwable $th) {
            return ['error' => 'Cannot delete area'];
        }
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        try {
            Area::whereIn('id', $request->rowIds)->delete();
        } catch (\Throwable $th) {
            return ['error' => 'Cannot delete selected area'];
        }

        return Response::json(['result' => 'ok']);
    }
}
