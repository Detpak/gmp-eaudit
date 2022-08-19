<?php

namespace App\Helpers;

class CommonHelpers
{
    public static function getSubjectWord($count)
    {
        return $count > 1 ? 'are' : 'is';
    }
}
