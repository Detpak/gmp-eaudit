<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditProcessController extends Controller
{
    public function apiSubmitAudit(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'cycle_id'                      => 'required|exists:audit_cycles,id',
                'area_id'                       => 'required|exists:areas,id',
                'cgroup_id'                     => 'required|exists:criteria_groups,id',
                'criteria_passes.*.info.desc'   => 'required_if:criteria_passes.*.fail,true'
            ],
            [
                'criteria_passes.*.info.desc.required_if' => 'Description must be filled'
            ],
            [
                'area_id' => 'area'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        return ['result' => 'ok', 'request' => $request->all()];
    }
}
