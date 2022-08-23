<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class DivisionController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Division::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEdit(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Division::find($request->id);

        if (!$data) {
            return Response::json(['result' => 'Data not found'], 404);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data->update($request->all());

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $data = Division::find($id);

        if (!$data) {
            return ['result' => 'Data not found'];
        }

        return $data;
    }

    public function apiFetch(Request $request)
    {
        $query = Division::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('entities', 'entities.id', '=', 'divisions.entity_id')
            ->select('divisions.id',
                     'divisions.name',
                     'entities.name as entity_name');

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        $division = Division::withCount('departments')->find($id);

        if ($division->departments_count > 0) {
            $subject = CommonHelpers::getSubjectWord($division->departments_count);
            return ['error' => "Cannot delete division. There {$subject} {$division->departments_count} registered department(s) under the division."];
        }

        $division->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->rowIds) {
            return Response::json(['result' => 'error'], 404);
        }

        $divisions = Division::withCount('departments')->whereIn('id', $request->rowIds);
        $errorCount = 0;

        foreach ($divisions->get() as $division) {
            if ($division->departments_count > 0) {
                $errorCount += $division->departments_count;
            }
        }

        if ($errorCount > 0) {
            $subject = CommonHelpers::getSubjectWord($errorCount);
            return ['error' => "Cannot delete divisions. There {$subject} {$errorCount} registered department(s) under some divisions."];
        }

        $divisions->delete();

        return ['result' => 'ok'];
    }

    public function apiFetchOptions()
    {
        return Division::select('id', 'name')->get();
    }
}
