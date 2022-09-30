<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Models\Criteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CriteriaController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'code' => 'required|string|max:16|unique:criterias,code',
                'name' => 'required|string|max:255',
                'weight' => 'required|numeric|max:100|min:1'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Criteria::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEdit(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Criteria::find($request->id);

        if (!$data) {
            return ['result' => 'Data not found'];
        }

        $validator = Validator::make(
            $request->all(),
            [
                'code' => ['required', 'string', 'max:16', Rule::unique('criterias', 'code')->ignore($request->id)],
                'name' => 'required|string|max:255',
                'weight' => 'required|numeric|max:100|min:1'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data->update($request->all());

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $data = Criteria::find($id);

        if (!$data) {
            return ['result' => 'Data not found'];
        }

        return $data;
    }

    public function apiFetch(Request $request)
    {
        $query = Criteria::query();

        if ($request->search) {
            $query->where('code', 'LIKE', "%{$request->search}%")
                ->orWhere('name', 'LIKE', "%{$request->search}%")
                ->orWhere('weight', 'LIKE', "%{$request->search}%");
        }

        $query->withCount('groups');

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        $criteria = Criteria::find($id);
        $criteria = Criteria::withCount('groups')->find($id);

        if ($criteria->groups_count > 0) {
            $subject = CommonHelpers::getSubjectWord($criteria->groups_count);
            return ['error' => "Cannot delete criteria. There {$subject} {$criteria->groups_count} registered group(s) under the criteria."];
        }

        $criteria->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->rowIds) {
            return Response::json(['result' => 'error'], 404);
        }

        $criterias = Criteria::whereIn('id', $request->rowIds);
        $criterias = Criteria::withCount('groups')->whereIn('id', $request->rowIds);
        $errorCount = 0;

        foreach ($criterias->get() as $criteria) {
            if ($criteria->groups_count > 0) {
                $errorCount += $criteria->groups_count;
            }
        }

        if ($errorCount > 0) {
            $subject = CommonHelpers::getSubjectWord($errorCount);
            return ['error' => "Cannot delete criterias. There {$subject} {$errorCount} registered group(s) under some criterias."];
        }

        $criterias->delete();

        return ['result' => 'ok'];
    }

    public function apiGetSelected(Request $request)
    {
        return Criteria::whereIn('id', $request->ids)->get();
    }
}
