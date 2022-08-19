<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address_1',
        'address_2',
        'city',
        'zip',
        'npwp',
        'desc',
    ];

    public function divisions()
    {
        return $this->hasMany(Division::class, 'entity_id');
    }
}
