<?php

namespace App\Http\Controllers;

use App\Helpers\AppStateHelpers;
use App\Models\AppState;
use App\Models\Area;
use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\FailedPhoto;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                'start_date' => 'required|date|date_format:Y-m-d',
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
            $activeCycle->close_date = Carbon::now()->toDateTimeString();
            $activeCycle->save();
        }

        $startDate = Carbon::createFromFormat('Y-m-d', $request->start_date);
        $lastCycleDate = AppStateHelpers::getState()->last_cycle_date;

        // Reset cycle count when we're in the new year
        if ($lastCycleDate && $startDate->year > Carbon::createFromFormat('Y-m-d', $lastCycleDate)->year) {
            AppStateHelpers::resetCycleCount();
        }

        $state = AppStateHelpers::incrementCycle($startDate);

        $cycleNumber = str_pad($state->current_cycle, 2, '0', STR_PAD_LEFT);
        $monthNumber = str_pad($startDate->month, 2, '0', STR_PAD_LEFT);
        $yearNumber = $startDate->year % 100;
        $code = "GMP/{$yearNumber}{$monthNumber}";
        $newCycle = [
            'cycle_id' => "{$code}/{$cycleNumber}",
            'start_date' => $startDate,
            'finish_date' => $request->finish_date,
            'cgroup_id' => $request->cgroup_id,
            'desc' => $request->desc,
        ];

        try {
            $newAuditCycle = AuditCycle::create($newCycle);
        } catch (\Throwable $th) {
            Log::critical($th);
            return [
                'result' => 'error',
                'msg' => 'Internal error occurred, please contact administrator.',
                'detail' => $th
            ];
        }

        $areas = Area::get();

        if ($areas->count() == 0) {
            return [
                'result' => 'error',
                'msg' => 'Cannot start new cycle, there is no area registered.'
            ];
        }

        $records = $areas->map(function ($item, $key) use($newAuditCycle, $code) {
            $recordCode = str_pad($key + 1, 3, '0', STR_PAD_LEFT);
            $createdAt = Carbon::now();
            return [
                'code' => "{$code}/{$recordCode}",
                'area_id' => $item->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
                'cycle_id' => $newAuditCycle->id,
                'status' => 0
            ];
        });

        try {
            AuditRecord::insert($records->toArray());
        } catch (\Throwable $th) {
            Log::critical($th);
            return [
                'result' => 'error',
                'msg' => 'Internal error occurred, please contact administrator.',
                'detail' => $th
            ];
        }

        return ['result' => 'ok', 'request' => $request->all(), 'records' => $records];
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
            $query->with('criteriaGroup');
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
