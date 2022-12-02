<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuditCycleController;
use App\Http\Controllers\AuditProcessController;
use App\Http\Controllers\AuditRecordController;
use App\Http\Controllers\CorrectiveActionController;
use App\Http\Controllers\CriteriaController;
use App\Http\Controllers\CriteriaGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DevMenuController;
use App\Http\Controllers\EntityController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\TestbedController;
use App\Http\Controllers\UsersController;
use App\Models\AuditFinding;
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
    Route::middleware('private_api:auditor')->group(function() {
        Route::post('/submit-audit', [AuditProcessController::class, 'apiSubmitAudit']);
        Route::put('/submit-audit-images', [AuditProcessController::class, 'apiSubmitImages']);
        Route::post('/cancel-finding', [AuditProcessController::class, 'apiCancel']);
    });

    Route::middleware('private_api:auditee')->group(function() {
        Route::get('/ensure-auditee-privilege/{id}', [CorrectiveActionController::class, 'apiEnsureAuditeePrivilege']);
        Route::post('/add-corrective-action', [CorrectiveActionController::class, 'apiAdd']);
        Route::post('/close-corrective-action', [CorrectiveActionController::class, 'apiClose']);
    });

    Route::middleware('private_api')->group(function() {
        Route::post('/get-chart', [DashboardController::class, 'apiGetChart']);

        // Debug APIs
        if (env('APP_DEBUG')) {
            Route::get('dev/reset-current-cycle', [DevMenuController::class, 'apiResetCurrentCycle']);
            Route::get('dev/reset-findings-counter', [DevMenuController::class, 'apiResetFindingsCounter']);
            Route::get('dev/reset-ca/{id}', [DevMenuController::class, 'apiResetCorrectiveAction']);
            Route::get('dev/reset-ca-approval/{id}', [DevMenuController::class, 'apiResetApproval']);
            Route::get('dev/uncancel-ca/{id}', [DevMenuController::class, 'apiUncancel']);
            Route::get('dev/get-app-state', [DevMenuController::class, 'apiGetAppState']);
        }

        Route::get('/get-summary', [DashboardController::class, 'apiGetSummary']);

        // Audit cycle APIs
        Route::post('/new-cycle', [AuditCycleController::class, 'apiNewCycle']);
        Route::get('/get-active-cycle', [AuditCycleController::class, 'apiGetActiveCycle']);
        Route::get('/fetch-cycles', [AuditCycleController::class, 'apiFetchCycles']);
        Route::get('/close-cycle/{id}', [AuditCycleController::class, 'apiCloseCycle']);

        // Corrective action APIs
        //Route::get('/ensure-auditee-privilege/{id}', [CorrectiveActionController::class, 'apiEnsureAuditeePrivilege']);
        //Route::post('/add-corrective-action', [CorrectiveActionController::class, 'apiAdd']);
        Route::get('/fetch-corrective-actions', [CorrectiveActionController::class, 'apiFetch']);
        Route::get('/fetch-corrective-action-images/{id}', [CorrectiveActionController::class, 'apiFetchImages']);
        //Route::post('/close-corrective-action', [CorrectiveActionController::class, 'apiClose']);
        Route::get('/get-corrective-action/{id}', [CorrectiveActionController::class, 'apiGet']);

        // Audit records APIs
        Route::get('/fetch-records', [AuditRecordController::class, 'apiFetch']);

        // Audit findings APIs
        Route::get('/fetch-findings', [AuditProcessController::class, 'apiFetch']);
        Route::get('/fetch-finding-images/{findingId}', [AuditProcessController::class, 'apiFetchImages']);
        Route::get('/get-finding/{id}', [AuditProcessController::class, 'apiGet']);
        Route::get('/get-record-cases/{id}', [AuditProcessController::class, 'apiGetRecordCases']);

        // Criteria APIs
        Route::post('/add-criteria', [CriteriaController::class, 'apiAdd']);
        Route::post('/edit-criteria', [CriteriaController::class, 'apiEdit']);
        Route::get('/get-criteria/{id}', [CriteriaController::class, 'apiGet']);
        Route::get('/fetch-criterias', [CriteriaController::class, 'apiFetch']);
        Route::get('/delete-criteria/{id}', [CriteriaController::class, 'apiDelete']);
        Route::post('/delete-criterias', [CriteriaController::class, 'apiDeleteSelected']);
        Route::post('/get-criterias', [CriteriaController::class, 'apiGetSelected']);

        // Criteria Group APIs
        Route::post('/add-criteria-group', [CriteriaGroupController::class, 'apiAdd']);
        Route::post('/edit-criteria-group', [CriteriaGroupController::class, 'apiEdit']);
        Route::get('/get-criteria-group/{id}', [CriteriaGroupController::class, 'apiGet']);
        Route::get('/get-criteria-group-params/{id}', [CriteriaGroupController::class, 'apiGetParams']);
        Route::get('/fetch-criteria-groups', [CriteriaGroupController::class, 'apiFetch']);
        Route::get('/delete-criteria-group/{id}', [CriteriaGroupController::class, 'apiDelete']);
        Route::post('/delete-criteria-groups', [CriteriaGroupController::class, 'apiDeleteSelected']);
        Route::post('/get-criteria-groups', [CriteriaGroupController::class, 'apiGetSelected']);

        // Entity APIs
        Route::post('/add-entity', [EntityController::class, 'apiAdd']);
        Route::post('/edit-entity', [EntityController::class, 'apiEdit']);
        Route::get('/get-entity/{id}', [EntityController::class, 'apiGet']);
        Route::get('/fetch-entities', [EntityController::class, 'apiFetch']);
        Route::get('/delete-entity/{id}', [EntityController::class, 'apiDelete']);
        Route::post('/delete-entities', [EntityController::class, 'apiDeleteSelected']);
        Route::get('/fetch-entity-options', [EntityController::class, 'apiFetchOptions']);

        // Division APIs
        Route::post('/add-division', [DivisionController::class, 'apiAdd']);
        Route::post('/edit-division', [DivisionController::class, 'apiEdit']);
        Route::get('/get-division/{id}', [DivisionController::class, 'apiGet']);
        Route::get('/fetch-divisions', [DivisionController::class, 'apiFetch']);
        Route::get('/delete-division/{id}', [DivisionController::class, 'apiDelete']);
        Route::post('/delete-divisions', [DivisionController::class, 'apiDeleteSelected']);
        Route::get('/fetch-division-options', [DivisionController::class, 'apiFetchOptions']);

        // Plant APIs
        Route::post('/add-plant', [PlantController::class, 'apiAdd']);
        Route::post('/edit-plant', [PlantController::class, 'apiEdit']);
        Route::get('/get-plant/{id}', [PlantController::class, 'apiGet']);
        Route::get('/fetch-plants', [PlantController::class, 'apiFetch']);
        Route::get('/delete-plant/{id}', [PlantController::class, 'apiDelete']);
        Route::post('/delete-plants', [PlantController::class, 'apiDeleteSelected']);
        Route::get('/fetch-plant-options', [PlantController::class, 'apiFetchOptions']);

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
        Route::get('/get-current-user', [UsersController::class, 'apiGetCurrentUser']);
    });

    if (env('APP_ENV') != 'production') {
        Route::post('/modal-form-test', [TestbedController::class, 'modalFormTest']);
        Route::get('/fetch-modal-form-test/{id}', [TestbedController::class, 'fetchModalFormTest']);
    }
});
