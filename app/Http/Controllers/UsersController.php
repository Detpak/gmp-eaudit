<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller
{
    public function show()
    {
        return view('users');
    }

    public function apiAddRole(Request $request)
    {
        $data = $request->except(['userId']);
        $validator = Validator::make(
            $data,
            [
                'roleName' => 'required|string|unique:roles,name|max:255',
                'remarks' => 'nullable|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        $accessInfo = $request->except(['userId', 'roleName', 'remarks']);

        Role::create([
            'name' => $request->roleName,
            'access_info' => json_encode($accessInfo),
            'remarks' => $request->remarks
        ]);

        return Response::json(['result' => 'ok']);
    }

    public function apiGetRole($id)
    {
        $role = Role::find($id);
        $accessInfo = json_decode($role->access_info);

        return [
            'chRoleName' => $role->name,
            'chRemarks' => $role->remarks,
            'chDashboardAccess' => isset($accessInfo->dashboardAccess) ? $accessInfo->dashboardAccess : null,
            'chAuditAccess' => isset($accessInfo->auditAccess) ? $accessInfo->auditAccess : null,
            'chAuditCycleAccess' => isset($accessInfo->auditCycleAccess) ? $accessInfo->auditCycleAccess : null,
            'chAuditRecordAccess' => isset($accessInfo->auditRecordAccess) ? $accessInfo->auditRecordAccess : null,
            'chAuditDetailAccess' => isset($accessInfo->auditDetailAccess) ? $accessInfo->auditDetailAccess : null,
            'chUsersAccess' => isset($accessInfo->usersAccess) ? $accessInfo->usersAccess : null,
            'chUsersRoleAccess' => isset($accessInfo->usersRoleAccess) ? $accessInfo->auditAccess : null,
            'chUsersUserListAccess' => isset($accessInfo->usersUserListAccess) ? $accessInfo->usersUserListAccess : null,
        ];
    }

    public function apiFetchRoles(Request $request)
    {
        return Role::paginate(50);
    }

    public function apiDeleteRole($id)
    {
        Role::find($id)->delete();
        return Response::json(['result' => 'ok']);
    }

    public function apiDeleteRoles(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        Role::whereIn('id', $request->rowIds)->delete();

        return Response::json(['result' => 'ok']);
    }

    public function apiChangeRole(Request $request, $id)
    {
        return Response::json(['result' => 'ok']);
    }
}
