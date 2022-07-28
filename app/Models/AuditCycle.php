<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'close_time',
    ];
}
