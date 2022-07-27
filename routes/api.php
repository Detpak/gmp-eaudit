<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TestbedController;
use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('/v1')->group(function() {
    Route::middleware('private_api')->group(function() {
        Route::post('/get-chart', [DashboardController::class, 'apiGetChart']);

        // Role APIs
        Route::post('/add-role', [UsersController::class, 'apiAddRole']);
        Route::post('/edit-role', [UsersController::class, 'apiEditRole']);
        Route::get('/get-role/{id}', [UsersController::class, 'apiGetRole']);
        Route::get('/fetch-roles', [UsersController::class, 'apiFetchRoles']);
        Route::get('/delete-role/{id}', [UsersController::class, 'apiDeleteRole']);
        Route::post('/delete-roles', [UsersController::class, 'apiDeleteRoles']);
        Route::get('/fetch-role-options', [UsersController::class, 'apiFetchRoleOptions']);

        // Users APIs
        Route::post('/add-user', [UsersController::class, 'apiAddUser']);
        Route::post('/edit-user', [UsersController::class, 'apiEditUser']);
        Route::get('/get-user/{id}', [UsersController::class, 'apiGetUser']);
        Route::get('/fetch-users', [UsersController::class, 'apiFetchUsers']);
        Route::get('/delete-user/{id}', [UsersController::class, 'apiDeleteUser']);
        Route::post('/delete-users', [UsersController::class, 'apiDeleteUsers']);
    });

    if (env('APP_ENV') != 'production') {
        Route::post('/modal-form-test', [TestbedController::class, 'modalFormTest']);
        Route::get('/fetch-modal-form-test/{id}', [TestbedController::class, 'fetchModalFormTest']);
    }
});
