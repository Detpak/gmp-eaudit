<?php

namespace App\Http\Controllers;

use App\Models\AuditRecord;
use Illuminate\Http\Request;

class AuditRecordController extends Controller
{
    public function apiFetch(Request $request)
    {
        $query = AuditRecord::query();

        if ($request->search) {
            $query->where('code', 'LIKE', "%{$request->search}%");
        }

        $query->with('area', function ($query) {
            $query->with('department', function ($query) {
                $query->select('id', 'name');
                $query->with('pics', function ($query) {
                    $query->select('name');
                });
            });
        });

        $query->with('auditor', function ($query) {
            $query->select('id', 'name');
        });

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($request->max);
    }
}
