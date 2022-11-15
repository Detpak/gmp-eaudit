<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PlantController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'code'          => 'required|string|max:4|unique:plants,code',
                'name'          => 'required|string|max:255',
                'address'       => 'required|string|max:65535',
                'city'          => 'required|string|max:255',
                'zip'           => ['required', 'regex:/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/', 'max:255'],
                'entity_id'     => 'required|exists:entities,id',
            ],
            [
                'zip.regex'     => 'The :attribute is invalid.',
            ],
            [
                'zip'           => 'zip code',
                'entity_id'     => 'entity'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Plant::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEdit(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Plant::find($request->id);

        if (!$data) {
            return ['result' => 'Data not found'];
        }

        $validator = Validator::make(
            $request->all(),
            [
                'code'          => ['required', 'string', 'max:4', Rule::unique('plants', 'code')->ignore($request->id)],
                'name'          => 'required|string|max:255',
                'address'       => 'required|string|max:65535',
                'city'          => 'required|string|max:255',
                'zip'           => ['required', 'regex:/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/', 'max:255'],
                'entity_id'     => 'required|exists:entities,id',
            ],
            [
                'zip.regex'     => 'The :attribute is invalid.',
            ],
            [
                'zip'           => 'zip code',
                'entity_id'     => 'entity'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data->update($request->all());

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $data = Plant::find($id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        return $data;
    }

    public function apiFetch(Request $request)
    {
        $query = Plant::query();

        if ($request->search) {
            $query->where('code', 'LIKE', "%{$request->search}%")
                ->orWhere('name', 'LIKE', "%{$request->search}%")
                ->orWhere('address', 'LIKE', "%{$request->search}%")
                ->orWhere('city', 'LIKE', "%{$request->search}%")
                ->orWhere('zip', 'LIKE', "%{$request->search}%")
                ->orWhere('entity_name', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('entities', 'entities.id', '=', 'plants.entity_id')
            ->select('plants.id',
                     'plants.code',
                     'plants.name',
                     'plants.address',
                     'plants.city',
                     'plants.zip',
                     'entities.name as entity_name')
            ->withCount('areas');

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        $plant = Plant::withCount('areas')->find($id);

        if ($plant->areas_count > 0) {
            $subject = CommonHelpers::getSubjectWord($plant->areas_count);
            return ['error' => "Cannot delete plant. There {$subject} {$plant->areas_count} registered area(s) under the plant."];
        }

        $plant->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->rowIds) {
            return Response::json(['result' => 'error'], 404);
        }

        $plants = Plant::withCount('areas')->whereIn('id', $request->rowIds);
        $errorCount = 0;

        foreach ($plants->get() as $plant) {
            if ($plant->areas_count > 0) {
                $errorCount += $plant->areas_count;
            }
        }

        if ($errorCount > 0) {
            $subject = CommonHelpers::getSubjectWord($errorCount);
            return ['error' => "Cannot delete plants. There {$subject} {$errorCount} registered area(s) under some plants."];
        }

        $plants->delete();

        return ['result' => 'ok'];
    }

    public function apiFetchOptions()
    {
        return Plant::select('id', 'name', 'code')->get();
    }
}
