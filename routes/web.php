<?php

use App\Http\Controllers\AppController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\AuditProcessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\TestbedController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WorkCenterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [LoginController::class, 'show']);
Route::post('/auth', [LoginController::class, 'auth']);
Route::get('/deauth', [LoginController::class, 'deauth']);

Route::middleware('user')->group(function() {
    //Route::get('/app', function() { return redirect()->intended('/app/dashboard'); });
    Route::view('/portal', 'secondary_page', ['page' => 'portal']);
    Route::redirect('/app', '/app/dashboard');
    Route::view('/app/{path?}', 'main_view')->where('path', '.*')->middleware(['desktop_only', 'gmp_panel_user']);
    Route::view('/audit', 'secondary_page', ['page' => 'audit'])->middleware('auditor');

    Route::view('/approve-ca/{caId}', 'secondary_page', ['page' => 'approve_ca'])
        ->where("caId", ".*")
        ->middleware('auditor');

    Route::view('/corrective-action/{findingId?}', 'secondary_page', ['page' => 'corrective_action'])
        ->where("findingId", ".*")
        ->middleware('auditee');

    // Route::prefix('/admin')->group(function() {
    //     Route::get('/', function() { return redirect()->intended('admin/dashboard'); });
    //     Route::get('/dashboard', [DashboardController::class, 'show']);
    //     Route::get('/audit', [AuditController::class, 'show']);
    //     Route::get('/work-center', [WorkCenterController::class, 'show']);
    //     Route::get('/users', [UsersController::class, 'show']);
    //     Route::get('/testbed', [TestbedController::class, 'show']);
    // });
});
