<?php

namespace App\Http\Controllers;

use App\Models\AuditCycle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class AuditCycleController extends Controller
{
    public function show()
    {
        return view('audit');
    }

    public function apiNewCycle(Request $request)
    {
        // 1. Check overlapping date ranges
        // 2. If overlaps, check each of
        // $activeCycle = AuditCycle::whereNull('close_time')->first();
        // $lastId = 1;

        $validator = Validator::make(
            $request->all(),
            [
                'start_date' => 'required',
                'end_date' => 'required',
            ],
            [],
            [
                'end_date' => 'due date'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $date = Carbon::createFromFormat('Y-m-d\TH:i', $request->start_date);

        // // Close current cycle
        // if ($activeCycle) {
        //     $lastId = $activeCycle->id + 1;
        // }

        // AuditCycle::create(['label' => "GMP-{$lastId}"]);
        return ['result' => 'ok', 'request' => $request->all(), 'date' => $date];
    }

    public function apiGetActiveCycle()
    {
        return ['result' => AuditCycle::whereNull('close_time')->first()];
    }

    public function apiFetchCycles(Request $request)
    {
        $query = AuditCycle::query()->select('id', 'label', 'open_time', 'close_time');

        if ($request->search) {
            $query->where('label', 'LIKE', "%{$request->search}%");

            if ($request->list != '1') {
                $query->orWhere('open_time', 'LIKE', "%{$request->search}%")
                      ->orWhere('close_time', 'LIKE', "%{$request->search}%");
            }
        }

        if ($request->list == '1') {
            $query->whereNull('close_time');
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($request->max);
    }

    public function apiCloseOrReopen(Request $request, $id)
    {
        $cycle = AuditCycle::find($id);

        if (!$cycle) {
            return Response::json(['result' => 'Data not found.'], 404);
        }

        if ($request->close == '1') {
            $cycle->close_time = Carbon::now()->toDateTimeString();
        }
        else {
            $cycle->close_time = null;
        }

        $cycle->save();

        return ['result' => 'ok'];
    }
}
