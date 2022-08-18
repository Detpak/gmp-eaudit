<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
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
            'dashboard' => isset($accessInfo->dashboard) ? $accessInfo->dashboard : null,
            'audit' => isset($accessInfo->audit) ? $accessInfo->audit : null,
            'workplace' => isset($accessInfo->workplace) ? $accessInfo->workplace : null,
            'users' => isset($accessInfo->users) ? $accessInfo->users : null,
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
        ];

        $accessInfo = $request->except(['id', 'roleName', 'remarks']);

        if (sizeof($accessInfo) != 0) {
            $updateColumn['access_info'] = $accessInfo;
        }

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
                'login_id' => 'required|string|max:255',
                'email' => 'nullable|string|email|max:255',
                'role_id' => 'required|exists:roles,id'
            ],
            [],
            [
                'role_id' => 'user role'
            ]);

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        User::create($request->all());

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
                'role_id' => 'required|exists:roles,id'
            ],
            [],
            [
                'role_id' => 'user role'
            ]);

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        $user = User::find($request->id);

        if (!$user) {
            return Response::json(['result' => 'Data not found']);
        }

        $user->update($request->except('id'));

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

        return $request->all ? $query->get() : $query->paginate($request->max);
    }

    public function apiDeleteUser($id)
    {
        User::find($id)->delete();
        return Response::json(['result' => 'ok']);
    }

    public function apiDeleteUsers(Request $request)
    {
        if (!$request->has('rowIds')) {
            return Response::json(['result' => 'error'], 404);
        }

        User::whereIn('id', $request->rowIds)->delete();

        return Response::json(['result' => 'ok']);
    }
}
