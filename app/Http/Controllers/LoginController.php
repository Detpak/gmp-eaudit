<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function show()
    {
        if (Session::has('eaudit_id') && User::where('login', Session::get('eaudit_id'))->first()) {
            return Redirect::intended('admin');
        }

        return view('login');
    }

    public function auth(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'loginID' => 'required|string|exists:user,login|max:255',
                'loginPassword' => 'required|string|min:8'
            ],
            [
                'loginID.required' => 'Username must be filled.',
                'loginID.exists' => 'Invalid username.',
                'loginID.max' => 'Username is too long. (max. 50 characters)',

                'loginPassword.required' => 'Password must be filled.',
                'loginPassword.min' => 'Password is too short. (min. 8 characters)',
            ]);

        if ($validator->fails()) {
            return redirect('/')
                ->withErrors($validator)
                ->withInput();
        }

        // if (env('APP_ENV') == 'local') {

        // }

        $user = User::where('login', $request->loginID)->first();

        Session::put('eaudit_id', $user->login);
        Session::put('eaudit_name', $user->name);
        Session::put('eaudit_usergroup', $user->usergroup_id);

        return Redirect::intended('admin/');
    }

    public function deauth()
    {
        Session::remove('eaudit_id');
        Session::remove('eaudit_name');
        Session::remove('eaudit_usergroup');

        return Redirect::intended('/');
    }
}
