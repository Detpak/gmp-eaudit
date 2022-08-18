<?php

namespace App\Http\Controllers;

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

        return $query->paginate($request->max);
    }

    public function apiDelete($id)
    {
        Division::find($id)->delete();
        return ['result' => 'ok'];
    }

    public function apiDeleteSelected(Request $request)
    {
        if (!$request->rowIds) {
            return Response::json(['result' => 'error'], 404);
        }

        Division::whereIn('id', $request->rowIds)->delete();
        return ['result' => 'ok'];
    }
}
