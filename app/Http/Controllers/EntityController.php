<?php

namespace App\Http\Controllers;

use App\Models\Entity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EntityController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name'          => 'required|string|max:255|unique:entities,name',
                'address_1'     => 'required|string|max:65535',
                'address_2'     => 'nullable|string|max:65535',
                'zip'           => [ 'required', 'regex:/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/', 'max:255' ],
                'npwp'          => [ 'required', 'regex:/(^\d{15}$)/', 'max:15' ],
                'desc'          => 'nullable|string|max:65535',
            ],
            [
                'zip.regex'     => 'The :attribute is invalid.',
                'npwp.regex'    => 'The :attribute is invallid'
            ],
            [
                'zip'           => 'zip code',
                'npwp'          => 'NPWP',
                'desc'          => 'description',
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        Entity::create($request->all());

        return ['result' => 'ok'];
    }

    public function apiEdit(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Entity::find($request->id);

        if (!$data) {
            return ['result' => 'Data not found'];
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name'          => [ 'required', 'string', 'max:255', Rule::unique('entities', 'name')->ignore($request->id) ],
                'address_1'     => 'required|string|max:65535',
                'address_2'     => 'nullable|string|max:65535',
                'zip'           => [ 'required', 'regex:/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/', 'max:255' ],
                'npwp'          => [ 'required', 'regex:/(^\d{15}$)/', 'max:15' ],
                'desc'          => 'nullable|string|max:65535',
            ],
            [
                'zip.regex'     => 'The :attribute is invalid.',
                'npwp.regex'    => 'The :attribute is invallid'
            ],
            [
                'zip'           => 'zip code',
                'npwp'          => 'NPWP',
                'desc'          => 'description',
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $data->update($request->all());

        return ['result' => 'ok'];
    }

    public function apiGet($id)
    {
        $data = Entity::find($id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        return $data;
    }

    public function apiFetch(Request $request)
    {
        $query = Entity::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('address_1', 'LIKE', "%{$request->search}%")
                ->orWhere('address_2', 'LIKE', "%{$request->search}%")
                ->orWhere('zip', 'LIKE', "%{$request->search}%")
                ->orWhere('npwp', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        Entity::find($id)->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        Entity::whereIn('id', $request->rowIds)->delete();
        return ['result' => 'ok'];
    }
}
