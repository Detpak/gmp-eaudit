<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;


class Filtering
{
    private static $FILTER_OP_EQ = 0;
    private static $FILTER_OP_NE = 1;
    private static $FILTER_OP_LT = 2;
    private static $FILTER_OP_LE = 3;
    private static $FILTER_OP_GT = 4;
    private static $FILTER_OP_GE = 5;
    private static $FILTER_OP_BETWEEN = 6;

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

    public function done()
    {
        return $this->builder;
    }

    public static function build($query, $mode)
    {
        return new Filtering($query, $mode);
    }
}
