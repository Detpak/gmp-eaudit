<?php

namespace App\Http\Controllers;

use App\Models\AuditCycle;
use App\Models\AuditFinding;
use App\Models\AuditRecord;
use App\Models\CorrectiveAction;
use App\Models\Machine;
use App\Models\MtCheckGroup;
use App\Models\TrAudit;
use App\Models\TrAuditItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class DashboardController extends Controller
{
    public function show()
    {
        return view('main_view', ['viewtype' => 'dashboard']);
    }

    public function apiGetSummary(Request $request)
    {
        $cycle = AuditCycle::find($request->cycle_id);
        $finding = AuditFinding::join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
            ->where('audit_records.cycle_id', $cycle->id);

        return [
            'cycles' => AuditCycle::count(),
            'case_submitted' => $finding->count(),
            'corrective_actions' => CorrectiveAction::join('audit_findings', 'audit_findings.id', '=', 'corrective_actions.finding_id')
                ->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
                ->where('audit_records.cycle_id', $cycle->id)
                ->count(),
            'approved_ca' => $finding->where('audit_findings.status', '3')->count(),
            'current_cycle' => $cycle
        ];
    }

    public function apiGetChart(Request $request)
    {
        switch ($request->type) {
            case 'top10_approved':
                return CorrectiveAction::join('audit_findings', 'audit_findings.id', '=', 'corrective_actions.finding_id')
                    ->join('audit_records', 'audit_records.id', '=', 'audit_findings.record_id')
                    ->select(
                        DB::raw('any_value(audit_findings.ca_name) as name'),
                        DB::raw('count(audit_findings.ca_code) as count')
                    )
                    ->where('audit_records.cycle_id', $request->cycle_id)
                    ->groupBy('audit_findings.ca_code')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->get();

            case 'area_status':
                return [
                    'not_started' => AuditRecord::where('cycle_id', $request->cycle_id)->where('status', 0)->count(),
                    'in_progress' => AuditRecord::where('cycle_id', $request->cycle_id)->where('status', 1)->count(),
                    'done' => AuditRecord::where('cycle_id', $request->cycle_id)->where('status', 2)->count(),
                ];

            case 'top10_criteria':
                //return $cycle;
                return AuditFinding::join('audit_records', 'audit_findings.record_id', '=', 'audit_records.id')
                    ->select(DB::raw('any_value(audit_findings.ca_name) as name'), DB::raw('count(audit_findings.ca_code) as count'))
                    ->where('audit_records.cycle_id', $request->cycle_id)
                    ->groupBy('audit_findings.ca_code')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->get();

            case 'case_statistics':
                return AuditFinding::join('audit_records', 'audit_findings.record_id', '=', 'audit_records.id')
                    ->select(
                        DB::raw('SUM(CASE WHEN audit_findings.category = 0 THEN 1 ELSE 0 END) as observation'),
                        DB::raw('SUM(CASE WHEN audit_findings.category = 1 THEN 1 ELSE 0 END) as minor_nc'),
                        DB::raw('SUM(CASE WHEN audit_findings.category = 2 THEN 1 ELSE 0 END) as major_nc')
                    )
                    ->where('audit_records.cycle_id', $request->cycle_id)
                    ->first();

            case 'case_found_per_cycle':
                return AuditCycle::select('cycle_id', 'total_findings')
                    ->orderBy('id')
                    ->limit(10)
                    ->get();

            default:

                // case 'totalAuditSubmitted':
                //     return [
                //         'result' => TrAudit::where('active', 1)->where('status', 'finished')->count(),
                //         'type' => $request->type
                //     ];

                // case 'areaAudited':
                //     return [
                //         'result' => Machine::where('active', 1)->whereNotNull('mtcheckgroup_id')->count(),
                //         'type' => $request->type
                //     ];

                // case 'auditAreaGroup':
                //     return [
                //         'result' => MtCheckGroup::where('active', 1)->count(),
                //         'type' => $request->type
                //     ];

                // case 'currentAuditCycleStatus':
                //     return [
                //         'result' => TrAudit::selectRaw('traudit.status as name, count(*) as rowCount')
                //                             ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                //                             ->where('traudit.active', 1)
                //                             ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                //                             ->groupBy('traudit.status')
                //                             ->get(),
                //         'type' => $request->type
                //     ];

                // case 'notStartedAndInProgressAudit':
                //     return [
                //         'result' => TrAudit::selectRaw('mtcheckgroup.name as name, COUNT(*) AS rowCount')
                //                             ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                //                             ->leftJoin('machine', 'traudit.machine_id', '=', 'machine.id')
                //                             ->leftJoin('mtcheckgroup', 'machine.mtcheckgroup_id', '=', 'mtcheckgroup.id')
                //                             ->where('traudit.active', 1)
                //                             ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                //                             ->where(function($query) {
                //                                 $query->where('traudit.status', 'Not Started')
                //                                       ->orWhere('traudit.status', 'In-Progress');
                //                             })
                //                             ->groupBy('mtcheckgroup.name')
                //                             ->get(),
                //         'type' => $request->type
                //     ];

                // case 'submittedAudit':
                //     return [
                //         'result' => TrAudit::selectRaw('mtcheckgroup.name as name, COUNT(*) AS rowCount')
                //                             ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                //                             ->leftJoin('machine', 'traudit.machine_id', '=', 'machine.id')
                //                             ->leftJoin('mtcheckgroup', 'machine.mtcheckgroup_id', '=', 'mtcheckgroup.id')
                //                             ->where('traudit.active', 1)
                //                             ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                //                             ->where('traudit.status', 'Finished')
                //                             ->groupBy('mtcheckgroup.name')
                //                             ->get(),
                //         'type' => $request->type
                //     ];

                // case 'top10FailedParams':
                //     return [
                //         'result' => TrAuditItem::selectRaw('mtcheckitem.name as name, COUNT(*) AS rowCount')
                //                             ->leftJoin('mtcheckitem', 'traudititem.mtcheckitem_id', '=', 'mtcheckitem.id')
                //                             ->leftJoin('traudit', 'traudititem.traudit_id', '=', 'traudit.id')
                //                             ->leftJoin('trauditcycle', 'traudit.trauditcycle_id', '=', 'trauditcycle.id')
                //                             ->where('traudititem.active', 1)
                //                             ->where('trauditcycle.closetime', '0000-00-00 00:00:00')
                //                             ->where('traudititem.result', 'FAIL')
                //                             ->groupBy('mtcheckitem.name')
                //                             ->orderBy('rowCount', 'desc')
                //                             ->limit(10)
                //                             ->get(),
                //         'type' => $request->type
                //     ];
        }

        return Response::json([]);
    }
}
