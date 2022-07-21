<?php

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Facades\Session;

class UserHelpers
{
    public static function getUserData()
    {
        return User::where('login', Session::get('eaudit_id'))->first();
    }

    public static function isLoggedIn()
    {
        return Session::has('eaudit_id') && User::where('login', Session::get('eaudit_id'))->first();
    }

    public static function getUserId()
    {
        if (!UserHelpers::isLoggedIn()) {
            return null;
        }

        return Session::get('eaudit_id');
    }
}
