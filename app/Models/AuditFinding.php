<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditFinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_id',
        'auditor_id',
        'ca_name',
        'ca_code',
        'ca_weight',
        'cg_name',
        'cg_code',
        'category',
        'desc',
        'approved',
    ];
}
