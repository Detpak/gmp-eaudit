<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MtCheckGroup;
use App\Models\TrAudit;
use App\Models\TrAuditCycle;
use App\Models\TrAuditItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class DashboardController extends Controller
{
    public function show()
    {
        return view('dashboard');
    }

    public function apiGetChart(Request $request)
    {
        return ['error' => 'Work in progress'];

        if (!$request->has('type')) {
            return ['error' => 'Type not specified'];
        }

        switch ($request->type) {
            case 'totalCycles':
                return [
                    'result' => TrAuditCycle::where('active', 1)->count(),
                    'type' => $request->type
                ];

            case 'totalAuditSubmitted':
                return [
                    'result' => TrAudit::where('active', 1)->where('status', 'finished')->count(),
                    'type' => $request->type
                ];

            case 'areaAudited':
                return [
                    'result' => Machine::where('active', 1)->whereNotNull('mtcheckgroup_id')->count(),
                    'type' => $request->type
                ];

            case 'auditAreaGroup':
                return [
                    'result' => MtCheckGroup::where('active', 1)->count(),
                    'type' => $request->type
                ];

            case 'currentAuditCycleStatus':
                return [
                    'result' => TrAudit::selectRaw('traudit.status as name, count(*) as rowCount')
                                        ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                                        ->where('traudit.active', 1)
                                        ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                                        ->groupBy('traudit.status')
                                        ->get(),
                    'type' => $request->type
                ];

            case 'notStartedAndInProgressAudit':
                return [
                    'result' => TrAudit::selectRaw('mtcheckgroup.name as name, COUNT(*) AS rowCount')
                                        ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                                        ->leftJoin('machine', 'traudit.machine_id', '=', 'machine.id')
                                        ->leftJoin('mtcheckgroup', 'machine.mtcheckgroup_id', '=', 'mtcheckgroup.id')
                                        ->where('traudit.active', 1)
                                        ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                                        ->where(function($query) {
                                            $query->where('traudit.status', 'Not Started')
                                                  ->orWhere('traudit.status', 'In-Progress');
                                        })
                                        ->groupBy('mtcheckgroup.name')
                                        ->get(),
                    'type' => $request->type
                ];

            case 'submittedAudit':
                return [
                    'result' => TrAudit::selectRaw('mtcheckgroup.name as name, COUNT(*) AS rowCount')
                                        ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                                        ->leftJoin('machine', 'traudit.machine_id', '=', 'machine.id')
                                        ->leftJoin('mtcheckgroup', 'machine.mtcheckgroup_id', '=', 'mtcheckgroup.id')
                                        ->where('traudit.active', 1)
                                        ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                                        ->where('traudit.status', 'Finished')
                                        ->groupBy('mtcheckgroup.name')
                                        ->get(),
                    'type' => $request->type
                ];

            case 'top10FailedParams':
                return [
                    'result' => TrAuditItem::selectRaw('mtcheckitem.name as name, COUNT(*) AS rowCount')
                                        ->leftJoin('mtcheckitem', 'traudititem.mtcheckitem_id', '=', 'mtcheckitem.id')
                                        ->leftJoin('traudit', 'traudititem.traudit_id', '=', 'traudit.id')
                                        ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                                        ->where('traudititem.active', 1)
                                        ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                                        ->where('traudititem.result', 'FAIL')
                                        ->groupBy('mtcheckitem.name')
                                        ->orderBy('rowCount', 'desc')
                                        ->limit(10)
                                        ->get(),
                    'type' => $request->type
                ];
        }

        return Response::json(['error' => 'Unknown type']);
    }
}
