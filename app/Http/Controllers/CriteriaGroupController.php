<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\CriteriaGroup;
use App\Models\CriteriaGroupParam;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CriteriaGroupController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'code'              => 'required|string|unique:criteria_groups,code',
                'name'              => 'required|string|max:255',
                'remarks'           => 'nullable|string|max:65535',
                'criteria_ids'      => 'required',
                'weight'            => [Rule::in([100])]
            ],
            [
                'weight.in'         => 'The total weight must be 100%'
            ],
            [
                'criteria_ids'      => 'criteria(s)'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data = CriteriaGroup::create($request->except(['criteria_ids', 'weight']));

        $groupParams = Arr::map($request->criteria_ids, function($id) use($data) {
            return ['group_id' => $data->id, 'criteria_id' => $id];
        });

        CriteriaGroupParam::insert($groupParams);

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $dept = CriteriaGroup::find($id);

        if (!$dept) {
            return Response::json(['result' => 'Data not found']);
        }

        $attr = collect($dept->makeHidden(['id', 'created_at', 'updated_at'])->toArray());

        $criteriaIds = CriteriaGroupParam::select('criteria_id')
            ->where('group_id', $id)
            ->get()
            ->map(function($value) {
                return "{$value['criteria_id']}";
            });

        return $attr->merge(['criteria_ids' => $criteriaIds]);
    }

    public function apiFetch(Request $request)
    {
        $query = CriteriaGroup::query();

        if ($request->search) {
            $query->where('code', 'LIKE', "%{$request->search}%")
                ->orWhere('name', 'LIKE', "%{$request->search}%")
                ->orWhere('remarks', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->withCount('criterias');

        return $query->paginate($request->max);
    }
}
