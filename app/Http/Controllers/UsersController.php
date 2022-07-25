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

    public function apiFetchRoles(Request $request)
    {
        return Role::paginate(50);
    }
}
