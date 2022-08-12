<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPIC extends Model
{
    use HasFactory;

    protected $fillable = [
        'dept_id',
        'user_id',
    ];
}
