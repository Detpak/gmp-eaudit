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
            'roleName' => $role->name,
            'remarks' => $role->remarks,
            'dashboardAccess' => isset($accessInfo->dashboardAccess) ? $accessInfo->dashboardAccess : null,
            'auditAccess' => isset($accessInfo->auditAccess) ? $accessInfo->auditAccess : null,
            'auditCycleAccess' => isset($accessInfo->auditCycleAccess) ? $accessInfo->auditCycleAccess : null,
            'auditRecordAccess' => isset($accessInfo->auditRecordAccess) ? $accessInfo->auditRecordAccess : null,
            'auditDetailAccess' => isset($accessInfo->auditDetailAccess) ? $accessInfo->auditDetailAccess : null,
            'usersAccess' => isset($accessInfo->usersAccess) ? $accessInfo->usersAccess : null,
            'usersRoleAccess' => isset($accessInfo->usersRoleAccess) ? $accessInfo->auditAccess : null,
            'usersUserListAccess' => isset($accessInfo->usersUserListAccess) ? $accessInfo->usersUserListAccess : null,
        ];
    }

    public function apiFetchRoles(Request $request)
    {
        $query = Role::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('remarks', 'LIKE', "%{$request->search}%");
        }

        return $query->paginate(50);
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

    public function apiChangeRole(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Role::find($request->id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        $updateColumn = [];

        if ($request->roleName) {
            $updateColumn['name'] = $request->roleName;
        }

        if ($request->remarks) {
            $updateColumn['remarks'] = $request->remarks;
        }

        $accessInfo = $request->except(['roleName', 'remarks']);

        if (sizeof($accessInfo) != 0) {
            $updateColumn['access_info'] = $accessInfo;
        }

        $data->update($updateColumn);

        return Response::json(['result' => 'ok']);
    }
}
