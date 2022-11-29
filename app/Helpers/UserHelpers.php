<?php

namespace App\Helpers;

use App\Models\ApiAccessToken;
use App\Models\Role;
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

    public static function getRole()
    {
        return Role::find(Session::get('eaudit_role'));
    }

    public static function isAuditee()
    {
        return UserHelpers::getRole()->auditee;
    }

    public static function isAuditor()
    {
        return UserHelpers::getRole()->auditor;
    }

    public static function canOpenAdminPage()
    {
        $role = UserHelpers::getRole();

        foreach ($role->access_info as $route => $value) {
            switch (gettype($value)) {
                case 'boolean':
                    if ($value) {
                        return true;
                    }
                    break;
                case 'array':
                    if (collect($value)->some(true)) {
                        return true;
                    }
            }
        }

        return false;
    }
}
