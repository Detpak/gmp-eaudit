<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
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
        $validator = Validator::make(
            $request->all(),
            [
                'start_date' => 'required',
                'finish_date' => 'required|date|date_format:Y-m-d|after:start_date',
                'cgroup_id' => 'required|exists:criteria_groups,id',
                'desc' => 'nullable|string'
            ],
            [
                'cgroup_id.required' => 'The criteria group must be filled.'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $activeCycle = AuditCycle::whereNull('close_date')->first();

        if ($activeCycle) {
            return ['result' => 'error', 'msg' => 'Unable to start new cycle, there is one unfinished cycle.'];
        }

        $startDate = Carbon::createFromFormat('Y-m-d', $request->start_date);

        // Reset cycle count when we're in the new year
        if ($activeCycle && Carbon::createFromTimestamp($activeCycle->created_at)->year < $startDate->year) {
            AppStateHelpers::resetCycleCount();
        }

        $state = AppStateHelpers::incrementCycle($startDate);

        $cycleNumber = str_pad($state->current_cycle, 3, '0', STR_PAD_LEFT);
        $yearNumber = $startDate->year % 100;
        $newCycle = [
            'cycle_id' => "GMP/{$yearNumber}/{$cycleNumber}",
            'start_date' => $startDate,
            'finish_date' => $request->finish_date,
            'cgroup_id' => $request->cgroup_id,
            'desc' => $request->desc,
        ];

        AuditCycle::create($newCycle);

        return ['result' => 'ok', 'request' => $request->all(), 'cycle' => $newCycle];
    }

    public function apiGetActiveCycle()
    {
        return ['result' => AuditCycle::whereNull('close_date')->first()];
    }

    public function apiFetchCycles(Request $request)
    {
        $query = AuditCycle::query();

        if ($request->search) {
            $query->where('cycle_id', 'LIKE', "%{$request->search}%");

            if ($request->list != '1') {
                $query->orWhere('desc', 'LIKE', "%{$request->search}%")
                      ->orWhere('start_date', 'LIKE', "%{$request->search}%")
                      ->orWhere('finish_date', 'LIKE', "%{$request->search}%")
                      ->orWhere('close_date', 'LIKE', "%{$request->search}%");
            }
        }

        if ($request->list == '1') {
            $query->whereNull('close_date');
        }
        else {
            $query->with('criteriaGroup', function ($query) {
                $query->select('id', 'name');
            });
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($request->max);
    }

    public function apiCloseCycle(Request $request, $id)
    {
        $cycle = AuditCycle::find($id);

        if (!$cycle) {
            return Response::json(['result' => 'Data not found.'], 404);
        }

        $cycle->close_date = Carbon::now()->toDateTimeString();
        $cycle->save();

        return ['result' => 'ok'];
    }
}
