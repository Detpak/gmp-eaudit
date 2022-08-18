<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EntityController;
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

        // Audit APIs
        Route::post('/new-cycle', [AuditController::class, 'apiNewCycle']);
        Route::get('/get-active-cycle', [AuditController::class, 'apiGetActiveCycle']);
        Route::get('/fetch-cycles', [AuditController::class, 'apiFetchCycles']);

        // Entity APIs
        Route::post('/add-entity', [EntityController::class, 'apiAdd']);
        Route::post('/edit-entity', [EntityController::class, 'apiEdit']);
        Route::get('/get-entity/{id}', [EntityController::class, 'apiGet']);
        Route::get('/fetch-entities', [EntityController::class, 'apiFetch']);
        Route::get('/delete-entity/{id}', [EntityController::class, 'apiDelete']);
        Route::post('/delete-entities', [EntityController::class, 'apiDeleteSelected']);

        // Department APIs
        Route::post('/add-dept', [DepartmentController::class, 'apiAddDepartment']);
        Route::post('/edit-dept', [DepartmentController::class, 'apiEditDepartment']);
        Route::get('/get-dept/{id}', [DepartmentController::class, 'apiGetDepartment']);
        Route::get('/get-dept-pics/{id}', [DepartmentController::class, 'apiGetDepartmentPics']);
        Route::get('/fetch-depts', [DepartmentController::class, 'apiFetchDepartments']);
        Route::get('/delete-dept/{id}', [DepartmentController::class, 'apiDeleteDepartment']);
        Route::post('/delete-depts', [DepartmentController::class, 'apiDeleteDepartments']);
        Route::get('/fetch-dept-options', [DepartmentController::class, 'apiFetchOptions']);

        // Area APIs
        Route::post('/add-area', [AreaController::class, 'apiAdd']);
        Route::post('/edit-area', [AreaController::class, 'apiEdit']);
        Route::get('/get-area/{id}', [AreaController::class, 'apiGet']);
        Route::get('/fetch-areas', [AreaController::class, 'apiFetch']);
        Route::get('/delete-area/{id}', [AreaController::class, 'apiDelete']);
        Route::post('/delete-areas', [AreaController::class, 'apiDeleteSelected']);

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
        Route::post('/get-users', [UsersController::class, 'apiGetUsers']);
        Route::get('/fetch-users', [UsersController::class, 'apiFetchUsers']);
        Route::get('/delete-user/{id}', [UsersController::class, 'apiDeleteUser']);
        Route::post('/delete-users', [UsersController::class, 'apiDeleteUsers']);
    });

    if (env('APP_ENV') != 'production') {
        Route::post('/modal-form-test', [TestbedController::class, 'modalFormTest']);
        Route::get('/fetch-modal-form-test/{id}', [TestbedController::class, 'fetchModalFormTest']);
    }
});
