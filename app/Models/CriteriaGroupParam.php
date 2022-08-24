<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CriteriaGroupParam extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'criteria_id',
    ];
}
