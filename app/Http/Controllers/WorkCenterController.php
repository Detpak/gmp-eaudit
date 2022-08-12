<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class WorkCenterController extends Controller
{
    public function show()
    {
        return view('work_center');
    }
}
