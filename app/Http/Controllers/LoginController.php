<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function show()
    {
        return view('login');
    }

    public function auth(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'loginID' => 'required|string|alpha_dash|max:255',
                'loginPassword' => 'required|string|min:8'
            ],
            [
                'loginID.required' => 'Username harus diisi.',
                'loginID.alpha_dash' => 'Username hanya boleh berisi huruf, angka, tanda hubung dan garis bawah.',
                'loginID.max' => 'Username terlalu panjang (maksimal 255 karakter).',

                'loginPassword.required' => 'Kata sandi harus diisi.',
                'loginPassword.min' => 'Password terlalu pendek (minimal 8 karakter).',
            ]);

        if ($validator->fails()) {
            return redirect('/')
                ->withErrors($validator)
                ->withInput();
        }

        return redirect()->intended('admin/');
    }
}
