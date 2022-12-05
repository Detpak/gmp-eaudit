<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class CommonHelpers
{
    public static function getSubjectWord($count)
    {
        return $count > 1 ? 'are' : 'is';
    }

    public static function havingChain(Builder $query, $operator, $chain)
    {
        $queryStr = DB::raw(collect($chain)->implode(" {$operator} "));
        return $query->havingRaw($queryStr);
    }

    public static function makeDelegation($obj, $methodName)
    {
        return function(...$params) use($obj, $methodName) {
            call_user_func([$obj, $methodName], ...$params);
        };
    }
}
