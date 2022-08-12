<?php

namespace App\Http\Controllers;

use App\Models\AuditCycle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditController extends Controller
{
    public function show()
    {
        return view('audit');
    }

    public function apiNewCycle()
    {
        $activeCycle = AuditCycle::whereNull('close_time')->first();
        $lastId = 1;

        // Close current cycle
        if ($activeCycle) {
            $activeCycle->close_time = Carbon::now()->toDateTimeString();
            $activeCycle->save();
            $lastId = $activeCycle->id + 1;
        }

        AuditCycle::create(['label' => "GMP-{$lastId}"]);
        return ['result' => 'ok'];
    }

    public function apiGetActiveCycle()
    {
        return ['result' => AuditCycle::whereNull('close_time')->first()];
    }

    public function apiFetchCycles(Request $request)
    {
        $query = AuditCycle::query()->select('id', 'label', 'open_time', 'close_time');

        if ($request->search) {
            $query->where('label', 'LIKE', "%{$request->search}%")
                ->orWhere('open_time', 'LIKE', "%{$request->search}%")
                ->orWhere('close_time', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($request->max);
    }
}
