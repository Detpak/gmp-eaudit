<?php

namespace App\Http\Middleware;

use App\Helpers\UserHelpers;
use Closure;
use Illuminate\Http\Request;

class GmpPanelUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!UserHelpers::canOpenAdminPage()) {
            abort(404);
        }

        return $next($request);
    }
}
