<?php

namespace App\Http\Controllers;

use App\Helpers\CommonHelpers;
use App\Helpers\UserHelpers;
use App\Models\ApiAccessToken;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller
{
    public function show()
    {
        return view('users', ['roles' => Role::get()]);
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

        Role::create([
            'name' => $request->roleName,
            'access_info' => $request->access,
            'remarks' => $request->remarks,
            'auditee' => $request->auditee ? 1 : 0,
            'auditor' => $request->auditor,
        ]);

        return Response::json(['result' => 'ok']);
    }

    public function apiGetRole($id)
    {
        $role = Role::find($id);
        $accessInfo = $role->access_info;

        return [
            'roleName' => $role->name,
            'remarks' => $role->remarks,
            'auditee' => $role->auditee,
            'auditor' => $role->auditor,
            'access' => $accessInfo
        ];
    }

    public function apiFetchRoles(Request $request)
    {
        $query = Role::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('remarks', 'LIKE', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }

        return $query->paginate(25);
    }

    public function apiDeleteRole($id)
    {
        $role = Role::withCount('users')->find($id);

        if ($role->users_count > 0) {
            $subject = CommonHelpers::getSubjectWord($role->users_count);
            return ['error' => "Cannot delete role \"{$role->name}\". There {$subject} {$role->users_count} registered user(s) under the role."];
        }

        $role->delete();

        return Response::json(['result' => 'ok']);
    }

    public function apiDeleteRoles(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        $roles = Role::withCount('users')->whereIn('id', $request->rowIds);
        $errorCount = 0;

        foreach ($roles->get() as $role) {
            if ($role->users_count > 0) {
                $errorCount += $role->users_count;
            }
        }

        if ($errorCount > 0) {
            $subject = CommonHelpers::getSubjectWord($errorCount);
            return ['error' => "Cannot delete roles. There {$subject} {$errorCount} registered user(s) under some roles."];
        }

        $roles->delete();
        return Response::json(['result' => 'ok']);
    }

    public function apiEditRole(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $data = Role::find($request->id);

        if (!$data) {
            return Response::json(['result' => 'Data not found']);
        }

        $validator = Validator::make(
            $request->except(['id']),
            [
                'roleName' => 'required|string|max:255',
                'remarks' => 'nullable|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        $updateColumn = [
            'name' => $request->roleName,
            'remarks' => $request->remarks,
            'auditee' => $request->auditee ? 1 : 0,
            'auditor' => $request->auditor,
            'access_info' => $request->access,
        ];

        $data->update($updateColumn);

        return Response::json(['result' => 'ok']);
    }

    public function apiFetchRoleOptions()
    {
        return Role::get(['id', 'name']);
    }

    // Users APIs

    public function apiAddUser(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'employee_id' => 'required|numeric',
                'login_id' => 'required|string|max:255|unique:users,login_id',
                'email' => 'nullable|string|email|max:255',
                'password' => 'required|string|max:255|min:8|confirmed',
                'role_id' => 'required|exists:roles,id'
            ],
            [],
            [
                'role_id' => 'user role'
            ]);

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        $user = $request->except('password');
        $user = [
            ...$user,
            'password' => Hash::make($request->password)
        ];

        User::create($user);

        return Response::json(['result' => 'ok']);
    }

    public function apiEditUser(Request $request)
    {
        if (!$request->id) {
            return Response::json(['result' => 'error'], 404);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'employee_id' => 'required|numeric',
                'login_id' => 'required|string|max:255',
                'email' => 'nullable|string|email|max:255',
                'password' => 'nullable|string|max:255|min:8|confirmed',
                'role_id' => 'nullable|exists:roles,id'
            ],
            [],
            [
                'role_id' => 'user role'
            ]);

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        $user = User::find($request->id);

        if ($request->login_id != $user->login_id) {
            if (User::where('login_id', $request->login_id)->exists()) {
                return Response::json(['formError' => ['login_id' => ['Login ID is already used.']]]);
            }
        }

        if (!$user) {
            return Response::json(['result' => 'Data not found']);
        }

        $user->update($request->except('id', 'password'));

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return Response::json(['result' => 'ok']);
    }

    public function apiGetUser($id)
    {
        return User::find($id)->makeHidden(['id', 'created_at', 'updated_at']);
    }

    public function apiGetUsers(Request $request)
    {
        return User::whereIn('id', $request->ids)->get();
    }

    public function apiFetchUsers(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where('users.name', 'like', "%{$request->search}%")
                ->orWhere('users.employee_id', 'like', "%{$request->search}%")
                ->orWhere('users.login_id', 'like', "%{$request->search}%")
                ->orWhere('users.email', 'like', "%{$request->search}%");
        }

        if ($request->sort && $request->dir) {
            $query->orderBy($request->sort, $request->dir);
        }
        else {
            $query->orderBy('users.id', 'asc');
        }

        $query->leftJoin('roles', 'roles.id', '=', 'users.role_id')
              ->select('users.id',
                       'users.name',
                       'users.employee_id',
                       'users.login_id',
                       'users.email',
                       'roles.name as role_name');

        if($request->only_auditee) {
            $query->where('roles.auditee', 1);
        }

        return $request->all ? $query->get() : $query->paginate($request->max);
    }

    public function apiDeleteUser($id)
    {
        try {
            User::find($id)->delete();
        } catch (\Throwable $th) {
            return Response::json(['error' => 'Cannot delete the user.']);
        }

        return Response::json(['result' => 'ok']);
    }

    public function apiDeleteUsers(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        try {
            User::whereIn('id', $request->rowIds)->delete();
        } catch (\Throwable $th) {
            return Response::json(['error' => 'Cannot delete users.']);
        }

        return Response::json(['result' => 'ok']);
    }

    public function apiGetCurrentUser(Request $request)
    {
        $tokenSplit = explode('|', $request->bearerToken()); // [0] = user id, [1] = token
        $result = User::find($tokenSplit[0])->toArray();

        if (!$result['superadmin']) {
            $role = Role::find($result['role_id']);

            $result['auditee'] = $role->auditee;
            $result['auditor'] = $role->auditor;
            $result['access'] = $role->access_info;
            $result['admin_access'] = false;

            foreach ($role->access_info as $route => $value) {
                switch (gettype($value)) {
                    case 'boolean':
                        if ($value) {
                            $result['admin_access'] = true;
                        }
                        break;
                    case 'array':
                        if (collect($value)->some(true)) {
                            $result['admin_access'] = true;
                        }
                        break;
                }
            }
        }
        else {
            $result['auditee'] = false;
            $result['auditor'] = false;
            $result['admin_access'] = true;
        }

        return ['result' => $result];
    }
}
