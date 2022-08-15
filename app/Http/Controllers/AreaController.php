<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function apiFetch(Request $request) {
        $query = Area::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        $query->leftJoin('departments', 'departments.id', '=', 'areas.department_id')
            ->select('areas.id',
                     'areas.name',
                     'departments.name as dept_name');

        return $query->paginate(25);
    }
}
