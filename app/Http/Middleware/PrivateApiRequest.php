<?php

namespace App\Http\Middleware;

use App\Models\ApiAccessToken;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class PrivateApiRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $role = null)
    {
        if (!$request->bearerToken()) {
            return Response::json(['result' => 'error'], 404);
        }

        $tokenSplit = explode('|', $request->bearerToken()); // [0] = user id, [1] = token
        $user = User::find($tokenSplit[0]);

        if (!$user) {
            return Response::json(['result' => 'error'], 404);
        }

        $accessTokens = ApiAccessToken::where('user_id', $tokenSplit[0])->get();
        $result = false;

        // Find matching tokens
        foreach ($accessTokens as $accessToken) {
            if (Hash::check($tokenSplit[1], $accessToken->token)) {
                $result = true;
                break;
            }
        }

        if (!$result) {
            return Response::json(['result' => 'invalid_token']);
        }

        if ($role) {
            $roleData = $user->role;

            // Check if user has the appropriate role
            switch ($role) {
                case 'auditee':
                    if (!$roleData || !$roleData->auditee) {
                        return Response::json(['result' => 'error', 'msg' => 'Not permitted']);
                    }
                    break;
                case 'auditor':
                    if (!$roleData || !$roleData->auditor) {
                        return Response::json(['result' => 'error', 'msg' => 'Not permitted']);
                    }
                    break;
                case 'superadmin':
                    if (!$user->superadmin) {
                        return Response::json(['result' => 'error', 'msg' => 'Not permitted']);
                    }
                    break;
            }
        }

        $request->merge([
            'auth' => [
                'user_id' => $tokenSplit[0],
                'token' => $tokenSplit[1]
            ],
            'user' => $user
        ]);

        return $next($request);
    }
}
