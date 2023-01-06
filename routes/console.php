<?php

use App\Models\ApiAccessToken;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('gmp:superadmin', function () {
    $loginId = "su-" . Str::random(8);
    $pw = Str::random(16);

    $superadmin = [
        'name' => "Superuser {$loginId}",
        'employee_id' => $loginId,
        'login_id' => $loginId,
        'password' => Hash::make($pw),
        'superadmin' => true,
    ];

    User::create($superadmin);

    $this->comment("Note: Superadmin account can only log in once.");
    $this->comment("Username: {$loginId}");
    $this->comment("Password: {$pw}");
});
