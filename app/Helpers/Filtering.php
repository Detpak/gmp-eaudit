<?php

namespace App\Helpers;

use DateTime;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class Filtering
{
    private static $FILTER_OP_EQ = 0;
    private static $FILTER_OP_NE = 1;
    private static $FILTER_OP_LT = 2;
    private static $FILTER_OP_LE = 3;
    private static $FILTER_OP_GT = 4;
    private static $FILTER_OP_GE = 5;
    private static $FILTER_OP_BETWEEN = 6;

    private static $FILTER_OP_EQ_DATE = 7;
    private static $FILTER_OP_NE_DATE = 8;
    private static $FILTER_OP_LT_DATE = 9;
    private static $FILTER_OP_LE_DATE = 10;
    private static $FILTER_OP_GT_DATE = 11;
    private static $FILTER_OP_GE_DATE = 12;
    private static $FILTER_OP_BETWEEN_DATE = 13;

    private static $FILTER_OP_EQ_TIME = 14;
    private static $FILTER_OP_NE_TIME = 15;
    private static $FILTER_OP_LT_TIME = 16;
    private static $FILTER_OP_LE_TIME = 17;
    private static $FILTER_OP_GT_TIME = 18;
    private static $FILTER_OP_GE_TIME = 19;
    private static $FILTER_OP_BETWEEN_TIME = 20;

    private static $filterOpTable = [
        '=',
        '!=',
        '<',
        '<=',
        '>',
        '>=',
    ];

    private Builder $builder;
    private $mode;

    public function __construct($queryBuilder, $mode)
    {
        $this->builder = $queryBuilder;
        $this->mode = $mode == 'any' ? 'or' : 'and';
    }

    public function whereString($column, $filterData)
    {
        if ($filterData == null) return $this;
        $this->builder->having($column, 'LIKE', "%{$filterData->value}%", $this->mode);
        return $this;
    }

    public function where($column, $filterData)
    {
        if ($filterData == null) return $this;

        if ($filterData->op == 'between') {
            $this->builder->whereBetween(
                $column,
                [$filterData->value, $filterData->value1],
                $this->mode);

            return $this;
        }

        $this->builder->where(
            $column,
            Filtering::$filterOpTable[$filterData->op],
            $filterData->value,
            $this->mode);

        return $this;
    }

    public function having($column, $filterData)
    {
        if ($filterData == null) return $this;

        if ($filterData->op == Filtering::$FILTER_OP_BETWEEN) {
            $this->builder->havingBetween(
                $column,
                [$filterData->value, $filterData->value1],
                $this->mode);

            return $this;
        }

        $this->builder->having(
            $column,
            Filtering::$filterOpTable[$filterData->op],
            $filterData->value,
            $this->mode);

        return $this;
    }

    public function havingDateTime($column, $filterData)
    {
        if ($filterData == null) return $this;

        $op = $filterData->op % 7;
        $filterOp = Filtering::$filterOpTable[$op];

        if ($filterData->op >= Filtering::$FILTER_OP_EQ &&
            $filterData->op <= Filtering::$FILTER_OP_BETWEEN)
        {
            if ($op == Filtering::$FILTER_OP_BETWEEN) {
                $this->builder->havingBetween(
                    $column,
                    [$filterData->value, $filterData->value1],
                    $this->mode);

                return $this;
            }

            $this->builder->having(
                $column,
                Filtering::$filterOpTable[$op],
                $filterData->value,
                $this->mode);
        }
        else if ($filterData->op >= Filtering::$FILTER_OP_EQ_DATE &&
                 $filterData->op <= Filtering::$FILTER_OP_BETWEEN_DATE)
        {
            if (!Filtering::validateDate($filterData->value)) {
                $this->builder->having($column, '');
                return $this;
            }

            if ($op == Filtering::$FILTER_OP_BETWEEN) {
                if (!Filtering::validateDate($filterData->value1)) {
                    return $this;
                }

                $this->builder->havingBetween(
                    $column,
                    [$filterData->value, $filterData->value1],
                    $this->mode);

                return $this;
            }

            $this->builder->havingRaw(
                "date({$column}) {$filterOp} '{$filterData->value}'",
                [],
                $this->mode);
        }

        return $this;
    }

    public function done()
    {
        return $this->builder;
    }

    public static function build($query, $mode)
    {
        return new Filtering($query, $mode);
    }

    private static function validateDate($date)
    {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
