<?php

namespace App\Helpers;

use App\Models\AppState;

class AppStateHelpers
{
    public static function init()
    {
        if (AppState::count() == 0) {
            AppState::create([]);
        }
    }

    public static function resetCycleCount()
    {
        AppStateHelpers::init();
        $state = AppState::first();
        $state->current_cycle = 0;
        $state->save();
    }

    public static function incrementCycle($time)
    {
        AppStateHelpers::init();
        $state = AppState::first();

        $state->current_cycle++;
        $state->save();

        return $state;
    }
}
