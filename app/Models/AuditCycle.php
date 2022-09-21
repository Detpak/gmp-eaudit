<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'cycle_id',
        'start_date',
        'close_date',
        'finish_date',
        'cgroup_id',
        'desc',
    ];

    public function criteriaGroup()
    {
        return $this->belongsTo(CriteriaGroup::class, 'cgroup_id');
    }
}
