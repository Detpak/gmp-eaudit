<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'division_id'
    ];

    public function pics()
    {
        return $this->belongsToMany(User::class, 'department_pics', 'dept_id', 'user_id');
    }

    public function areas()
    {
        return $this->hasMany(Area::class, 'department_id');
    }
}
