<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CriteriaGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'remarks',
    ];

    public function criterias()
    {
        return $this->belongsToMany(Criteria::class, 'criteria_group_params', 'group_id', 'criteria_id');
    }

    public function totalWeight()
    {
        return $this->belongsToMany(Criteria::class, 'criteria_group_params', 'group_id', 'criteria_id');
    }

    public function activeCycle()
    {
        return $this->hasMany(AuditCycle::class, 'cgroup_id');
    }
}
