<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            [
                'name' => 'Admin',
                'remarks' => '',
                'access_info' => json_encode([
                    [
                        'name' => 'dashboard',
                        'level' => 2
                    ],
                    [
                        'name' => 'audit',
                        'level' => 1,
                        'submenu' => [
                            ['name' => 'audit', 'level' => 1],
                            ['name' => 'audit_item', 'level' => 1],
                            ['name' => 'cycle', 'level' => 1]
                        ]
                    ],
                    [
                        'name' => 'users',
                        'level' => 1,
                        'submenu' => [
                            ['name' => 'roles', 'level' => 2],
                            ['name' => 'users', 'level' => 2],
                        ]
                    ]
                ])
            ],
            [
                'name' => 'User',
                'remarks' => '',
                'access_info' => json_encode([
                    [
                        'name' => 'dashboard',
                        'level' => 2
                    ],
                    [
                        'name' => 'audit',
                        'level' => 1,
                        'submenu' => [
                            ['name' => 'audit', 'level' => 1],
                            ['name' => 'audit_item', 'level' => 1],
                            ['name' => 'cycle', 'level' => 1]
                        ]
                    ],
                    [
                        'name' => 'users',
                        'level' => 0,
                        'submenu' => [
                            ['name' => 'roles', 'level' => 0],
                            ['name' => 'users', 'level' => 0],
                        ]
                    ]
                ])
            ]
        ];

        Role::insert($roles);
    }
}
