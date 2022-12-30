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
    // 1. Check existing superadmin user timeout.
    // 2. If the time is out, delete the superadmin user.

    $superadmins = User::where('superadmin', true);

    foreach ($superadmins->get() as $su) {
        ApiAccessToken::where('user_id', $su->id)->delete();
    }

    $superadmins->delete();

    $loginId = "su-" . Str::random(8);
    $pw = Str::random(16);

    $superadmin = [
        'name' => "Superuser {$loginId}",
        'employee_id' => $loginId,
        'login_id' => $loginId,
        'password' => Hash::make($pw),
        'expire_time' => Carbon::now()->addHour(),
        'superadmin' => true,
    ];

    User::create($superadmin);

    $this->comment("Username: {$loginId}");
    $this->comment("Password: {$pw}");
});
