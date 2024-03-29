<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class TestbedController extends Controller
{
    public function show()
    {
        return view('testbed');
    }

    public function modalFormTest(Request $request)
    {
        $validator = Validator::make(
            $request->except(['userId']),
            [
                'field1' => 'required|string',
                'field2' => 'required|string',
                'field3' => 'required|string',
            ]
        );

        if ($validator->fails()) {
            return Response::json(['formError' => $validator->errors()]);
        }

        return Response::json(['result' => 'ok']);
    }

    public function fetchModalFormTest($id)
    {
        sleep(2);
        return [
            'field1' => "field1 -> id: {$id}",
            'field2' => "field2 -> id: {$id}",
            'field3' => "field3 -> id: {$id}",
        ];
    }
}
