<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'weight'
    ];

    public function groups()
    {
        return $this->belongsToMany(CriteriaGroup::class, 'criteria_group_params', 'criteria_id', 'group_id');
    }
}
