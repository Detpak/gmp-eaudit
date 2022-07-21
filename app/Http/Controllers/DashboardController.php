<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MtCheckGroup;
use App\Models\TrAudit;
use App\Models\TrAuditCycle;
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
        }

        return Response::json(['error' => 'Unknown type']);
    }
}
