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

    public static function getState()
    {
        return AppState::first();
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

    public static function getFindingsCount()
    {
        AppStateHelpers::init();
        $state = AppState::first();
        return $state->num_findings;
    }

    public static function advanceFindingsCounter($count)
    {
        AppStateHelpers::init();
        $state = AppState::first();
        $state->num_findings += $count;
        $state->save();
    }

    public static function resetFindingsCounter()
    {
        AppStateHelpers::init();
        $state = AppState::first();
        $state->num_findings = 0;
        $state->save();
    }
}
