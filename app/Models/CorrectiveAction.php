<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectiveAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'finding_id',
        'desc',
    ];

    public function images() {
        return $this->hasMany(CorrectiveActionImages::class, 'ca_id');
    }
}
