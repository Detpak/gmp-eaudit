<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'auditor_id',
        'area_id',
        'cgroup_id',

    ];
}
