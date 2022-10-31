<?php

namespace App\Http\Controllers;

use App\Models\AuditFinding;
use App\Models\DepartmentPIC;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CorrectiveActionController extends Controller
{
    public function apiAdd(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'finding_id'    => 'required|exists:audit_findings,id',
                'desc'          => 'required|max:65536',
            ],
            [],
            [
                'desc'          => 'description'
            ]);

        if ($validator->fails()) {
            return ['formError' => $validator->errors()];
        }

        $caDate = Carbon::now();
        $images = collect();

        if (!$request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $name = $caDate->valueOf() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();
                $images->add($name);
            }
        }

        return [
            'result' => 'ok',
            'result_data' => [
                'images' => $images->toArray()
            ]
        ];
    }

    public function apiFetch(Request $request)
    {
        return [];
    }

    public function apiEnsureAuditeePrivilege(Request $request, $id)
    {
        $finding = AuditFinding::find($id);

        if (!$finding) {
            return [
                'result' => 'error',
                'msg' => 'Invalid case finding.',
            ];
        }

        $department = $finding->record->area->department;
        $picExists = DepartmentPIC::where('dept_id', $department->id)
            ->where('user_id', $request->auth['user_id'])
            ->exists();

        if (!$picExists) {
            return [
                'result' => 'error',
                'msg' => 'You are not allowed to take corrective action for this case.',
            ];
        }

        return ['result' => 'ok'];
    }
}
