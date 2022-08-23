<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'address',
        'city',
        'zip',
        'entity_id',
    ];

    public function areas()
    {
        return $this->hasMany(Area::class, 'plant_id');
    }
}
