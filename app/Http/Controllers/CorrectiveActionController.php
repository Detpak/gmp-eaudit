<?php

namespace App\Http\Controllers;

use App\Models\AuditFinding;
use App\Models\DepartmentPIC;
use Illuminate\Http\Request;

class CorrectiveActionController extends Controller
{
    public function apiFetch(Request $request)
    {
        return [];
    }

    public function apiEnsureAuditeePrivilege(Request $request, $id)
    {
        $department = AuditFinding::find($id)
            ->record
            ->area
            ->department;

        if (!$department) {
            return [
                'result' => 'error',
                'msg' => 'Invalid case finding',
            ];
        }

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
