<?php

namespace App\Http\Controllers;

use App\Helpers\UserHelpers;
use App\Models\ApiAccessToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function show()
    {
        if (UserHelpers::isLoggedIn()) {
            return Redirect::intended('admin');
        }

        return view('login');
    }

    public function auth(Request $request)
    {
        if (UserHelpers::isLoggedIn()) {
            return Redirect::intended('admin');
        }

        $validator = Validator::make(
            $request->all(),
            [
                'loginID' => 'required|string|exists:users,login_id|max:255',
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

        // This only applies on production
        if (env('APP_ENV') == 'production') {
            $ldap = ldap_connect("ldap://internal.detmold.com.au");
            $bind = @ldap_connect($ldap, "detmold\\" . $request->loginID, $request->loginPassword);
            ldap_close($ldap);

            // Reject login
            if (!$bind) {
                return Redirect::intended('/')
                    ->withErrors(['loginPassword' => 'Password is incorrect.'])
                    ->withInput();
            }
        }

        $user = User::where('login_id', $request->loginID)->first();
        $token = Str::random(32);
        $tokenHash = Hash::make($token);

        // Remove expired tokens
        ApiAccessToken::where('user_id', $user->id)
            ->where('expire_date', '<', Carbon::now())
            ->delete();

        // Create new token
        ApiAccessToken::create([
            'token' => $tokenHash,
            'user_id' => $user->id,
            'expire_date' => Carbon::now()->addDay()
        ]);

        // Put the user session
        Session::regenerate();
        Session::put('eaudit_id', $user->login_id);
        Session::put('eaudit_name', $user->name);
        Session::put('eaudit_role', $user->role_id);
        Session::put('eaudit_token', "{$user->id}|{$token}");

        return Redirect::intended('admin/dashboard');
    }

    public function deauth()
    {
        ApiAccessToken::where('token', Session::get('eaudit_token'))->delete();

        Session::regenerate();
        Session::regenerateToken();
        Session::remove('eaudit_id');
        Session::remove('eaudit_name');
        Session::remove('eaudit_role');
        Session::remove('eaudit_token');

        return Redirect::intended('/');
    }
}
