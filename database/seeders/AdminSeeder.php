<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Role::create([
            'name' => 'Administrator',
            'access_info' => '{}',
            'remarks' => ''
        ]);

        User::create([
            'name' => 'TestAdmin',
            'employee_id' => '1',
            'login_id' => 'Test.Admin',
            'email' => null,
            'role_id' => 1
        ]);
    }
}
