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
    ];
}
