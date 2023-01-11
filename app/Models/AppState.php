<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppState extends Model
{
    use HasFactory;

    protected $table = 'app_state';

    protected $fillable = [
        'current_cycle',
        'last_cycle_date',
        'last_audit_date',
        'num_findings'
    ];

    protected $casts = [
        'last_audit_date' => 'datetime:Y-m-d'
    ];
}
