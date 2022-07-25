<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\TestbedController;
use App\Http\Controllers\UsersController;
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

Route::middleware('admin')->group(function() {
    Route::get('/deauth', [LoginController::class, 'deauth']);

    Route::prefix('/admin')->group(function() {
        Route::get('/', function() { return redirect()->intended('admin/dashboard'); });
        Route::get('/dashboard', [DashboardController::class, 'show']);
        Route::get('/audit', [AuditController::class, 'show']);
        Route::get('/users', [UsersController::class, 'show']);
        Route::get('/testbed', [TestbedController::class, 'show']);
    });
});


