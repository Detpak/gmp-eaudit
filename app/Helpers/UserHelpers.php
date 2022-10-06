<?php

namespace App\Helpers;

use App\Models\ApiAccessToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Session;

class UserHelpers
{
    public static function getUserData()
    {
        return User::where('login_id', Session::get('eaudit_id'))->first();
    }

    public static function isLoggedIn()
    {
        return Session::has('eaudit_id') && User::where('login_id', Session::get('eaudit_id'))->first();
    }

    public static function getUserId()
    {
        if (!UserHelpers::isLoggedIn()) {
            return null;
        }

        return Session::get('eaudit_id');
    }

    public static function getUserToken()
    {
        $token = explode('|', Session::get('eaudit_token'));
        return (object)['id' => $token[0], 'token' => $token[1]];
    }
}
